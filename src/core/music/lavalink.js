const { LavalinkManager } = require("lavalink-client");
const lavalinkConfig = require("../../config/lavalink");
const musicConfig = require("../../config/music");
const botConfig = require("../../config/bot");
const Logger = require("../utils/Logger");

let lavalink;
const connectedNodes = new Set();
const reconnectTimers = new Map();
const positionTimers = new Map(); // guildId -> setInterval

// nodeName -> { guildId -> { voiceChannelId, textChannelId, currentTrack, position, volume } }
const nodePlayers = new Map();

function nodeLabel(node) {
  const op = node.options;
  const idx = lavalinkConfig.nodes.findIndex((n) => n.name === op.name);
  const num = idx >= 0 ? idx + 1 : "?";
  return `Node ${num} [${op.host}:${op.port}]`;
}

function startNodeReconnectLoop(nodeName) {
  if (reconnectTimers.has(nodeName)) return;

  const timer = setInterval(() => {
    let node = lavalink.nodeManager.nodes.get(nodeName);
    if (node?.connected) {
      clearInterval(timer);
      reconnectTimers.delete(nodeName);
      return;
    }

    if (!node) {
      const cfg = lavalinkConfig.nodes.find((n) => n.name === nodeName);
      if (!cfg) {
        clearInterval(timer);
        reconnectTimers.delete(nodeName);
        return;
      }
      node = lavalink.nodeManager.createNode({ ...cfg });
    }

    Logger.info(`Reconnecting ${nodeName} node...`);
    node.connect();
  }, 5 * 60 * 1000);

  reconnectTimers.set(nodeName, timer);
  Logger.info(`Periodic reconnect loop started for ${nodeName} (every 5 min)`);
}

async function init(client) {
  lavalink = new LavalinkManager({
    nodes: lavalinkConfig.nodes,
    sendToShard: (guildId, payload) => {
      client.guilds.cache.get(guildId)?.shard?.send(payload);
    },
    playerOptions: {
      defaultSearchPlatform: musicConfig.defaultSearchPlatform,
      applyVolumeAsFilter: false,
      clientBasedPositionUpdateInterval: 150,
    },
  });

  // Listen on nodeManager for real node events
  lavalink.nodeManager.on("connect", (node) => {
    const name = node.options.name;
    if (connectedNodes.has(name)) return;
    connectedNodes.add(name);
    Logger.ready(`Lavalink ${nodeLabel(node)} connected`);

    const timer = reconnectTimers.get(name);
    if (timer) {
      clearInterval(timer);
      reconnectTimers.delete(name);
      Logger.info(`Periodic reconnect loop stopped for ${name} (node connected)`);
    }
  });

  lavalink.nodeManager.on("disconnect", (node, { code, reason }) => {
    const name = node.options.name;
    if (!connectedNodes.has(name)) return;
    connectedNodes.delete(name);
    Logger.warn(`Lavalink ${nodeLabel(node)} disconnected (${code}) ${reason || ""}`);
    handleNodeFailover(name);
  });

  lavalink.nodeManager.on("destroy", (node, reason) => {
    const name = node.options.name;
    Logger.warn(`Lavalink ${nodeLabel(node)} destroyed (${reason})`);
    startNodeReconnectLoop(name);
  });

  lavalink.nodeManager.on("error", (node, err) => {
    Logger.warn(`Lavalink ${nodeLabel(node)} error: ${err.message}`);
  });

  // Catch errors on the manager itself
  lavalink.on("error", (err) => {
    Logger.error("Lavalink error:", err.message);
  });

  client.on("raw", (d) => lavalink.sendRawData(d));

  try {
    await lavalink.init({
      id: botConfig.clientId,
      username: client.user?.username || "bot",
    });
  } catch (err) {
    Logger.warn(`Lavalink init error (some nodes may be unavailable): ${err.message}`);
  }

  // Wait up to 20s for all nodes to connect
  await new Promise((resolve) => {
    const check = () => {
      const remaining = lavalinkConfig.nodes.filter((n) => !connectedNodes.has(n.name));
      if (remaining.length === 0) resolve();
    };
    lavalink.nodeManager.on("connect", check);
    setTimeout(() => {
      lavalink.nodeManager.removeListener("connect", check);
      resolve();
    }, 20000);
  });

  const total = lavalinkConfig.nodes.length;
  const connected = connectedNodes.size;
  const failed = lavalinkConfig.nodes.filter((n) => !connectedNodes.has(n.name));

  failed.forEach((cfg, i) => {
    const num = lavalinkConfig.nodes.findIndex((n) => n.name === cfg.name) + 1;
    Logger.warn(`Lavalink Node ${num} [${cfg.host}:${cfg.port}] not connected`);
  });

  if (connected > 0) {
    Logger.ready(`Lavalink ready — ${connected}/${total} node(s) connected`);
  } else {
    Logger.warn("Lavalink is not available — music features disabled");
  }

  return lavalink;
}

function cachePlayer(guildId, data) {
  const player = lavalink.getPlayer(guildId);
  if (!player) return;
  const nodeName = player.node?.name;
  if (!nodeName) return;
  if (!nodePlayers.has(nodeName)) nodePlayers.set(nodeName, new Map());
  nodePlayers.get(nodeName).set(guildId, data);
}

function uncachePlayer(guildId) {
  for (const [, guilds] of nodePlayers) {
    guilds.delete(guildId);
  }
}

function startPositionTracking(guildId) {
  stopPositionTracking(guildId);
  const timer = setInterval(() => {
    const player = lavalink?.getPlayer(guildId);
    if (!player || !player.playing) return;
    cachePlayer(guildId, {
      voiceChannelId: player.voiceChannelId,
      textChannelId: player.textChannelId,
      currentTrack: player.queue.current,
      position: player.position || 0,
      volume: player.volume,
    });
  }, 5000);
  positionTimers.set(guildId, timer);
}

function stopPositionTracking(guildId) {
  const timer = positionTimers.get(guildId);
  if (timer) {
    clearInterval(timer);
    positionTimers.delete(guildId);
  }
}

function getNextAvailableNode(failedNodeName) {
  for (const cfg of lavalinkConfig.nodes) {
    if (cfg.name !== failedNodeName && connectedNodes.has(cfg.name)) {
      return cfg.name;
    }
  }
  // No connected nodes — let Lavalink auto-select
  return undefined;
}

async function handleNodeFailover(nodeName) {
  const guilds = nodePlayers.get(nodeName);
  if (!guilds || !guilds.size) return;

  const available = getNextAvailableNode(nodeName);
  if (!available) {
    Logger.warn("No available Lavalink node for failover");
    return;
  }

  Logger.info(`Failing over ${guilds.size} guild(s) to node ${available}`);

  for (const [guildId, info] of guilds) {
    try {
      stopPositionTracking(guildId);
      const newPlayer = lavalink.createPlayer({
        guildId,
        voiceChannelId: info.voiceChannelId,
        textChannelId: info.textChannelId,
        selfDeaf: true,
        selfMute: false,
        volume: info.volume || 80,
        node: available,
      });

      if (info.voiceChannelId) await newPlayer.connect();

      if (info.currentTrack) {
        newPlayer.queue.add(info.currentTrack);
        await newPlayer.play({
          track: info.currentTrack,
          clientTrack: info.currentTrack,
          startTime: info.position || 0,
        });
      }

      cachePlayer(guildId, info);
      Logger.info(`Resumed guild ${guildId} on node ${available}`);
    } catch (err) {
      Logger.error(`Failover failed for guild ${guildId}:`, err.message);
    }
  }

  nodePlayers.delete(nodeName);
}

function get() {
  return lavalink;
}

module.exports = { init, get, cachePlayer, uncachePlayer, startPositionTracking, stopPositionTracking, getNextAvailableNode };

//======================
// Created by monavia
// Don't change if you don't know
//======================