const { LavalinkManager } = require("lavalink-client");
const lavalinkConfig = require("../../config/lavalink");
const musicConfig = require("../../config/music");
const botConfig = require("../../config/bot");
const Logger = require("../utils/Logger");

let lavalink;

// nodeName -> { guildId -> { voiceChannelId, textChannelId, currentTrack, position, volume } }
const nodePlayers = new Map();

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

  lavalink.on("nodeConnected", (node) => {
    Logger.info(`Lavalink node ready: ${node.host}:${node.port} (${node.name})`);
  });

  lavalink.on("nodeDisconnected", (node, code, reason) => {
    Logger.warn(`Lavalink node disconnected: ${node.host}:${node.port} (${code}) ${reason || ""}`);
    handleNodeFailover(node.name);
  });

  lavalink.on("nodeError", (node, err) =>
    Logger.error(`Lavalink node error: ${node.host}:${node.port}`, err.message),
  );
  lavalink.on("error", (err) =>
    Logger.error("Lavalink error:", err.message),
  );

  client.on("raw", (d) => lavalink.sendRawData(d));

  await lavalink.init({
    id: botConfig.clientId,
    username: client.user?.username || "bot",
  });

  if (lavalink.useable) {
    Logger.ready("Lavalink connected");
    return lavalink;
  }

  await new Promise((resolve) => {
    const done = () => {
      lavalink.removeListener("nodeConnected", done);
      resolve();
    };
    lavalink.on("nodeConnected", done);
    setTimeout(() => {
      lavalink.removeListener("nodeConnected", done);
      resolve();
    }, 15000);
  });

  if (lavalink.useable) {
    Logger.ready("Lavalink connected");
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

async function handleNodeFailover(nodeName) {
  const guilds = nodePlayers.get(nodeName);
  if (!guilds || !guilds.size) return;

  const available = findAvailableNode();
  if (!available) {
    Logger.warn("No available Lavalink node for failover");
    return;
  }

  Logger.info(`Failing over ${guilds.size} guild(s) to node ${available.name}`);

  for (const [guildId, info] of guilds) {
    try {
      const newPlayer = lavalink.createPlayer({
        guildId,
        voiceChannelId: info.voiceChannelId,
        textChannelId: info.textChannelId,
        selfDeaf: true,
        selfMute: false,
        volume: info.volume || 80,
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

      Logger.info(`Resumed guild ${guildId} on node ${available.name}`);
    } catch (err) {
      Logger.error(`Failover failed for guild ${guildId}:`, err.message);
    }
  }

  nodePlayers.delete(nodeName);
}

function findAvailableNode() {
  for (const [name] of lavalink.nodes) {
    const node = lavalink.nodes.get(name);
    if (node?.connected) return node;
  }
  return null;
}

function get() {
  return lavalink;
}

module.exports = { init, get, cachePlayer, uncachePlayer };