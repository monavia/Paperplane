const { LavalinkManager } = require("lavalink-client");
const lavalinkConfig = require("../../config/lavalink");
const musicConfig = require("../../config/music");
const botConfig = require("../../config/bot");
const Logger = require("../utils/Logger");

let lavalink;

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

  lavalink.on("nodeConnected", (node) => Logger.info(`Lavalink node connected: ${node.host}`));
  lavalink.on("nodeDisconnected", (node, code, reason) =>
    Logger.warn(`Lavalink node disconnected: ${node.host} (${code}) ${reason || ""}`),
  );
  lavalink.on("nodeError", (node, err) => Logger.error(`Lavalink node error: ${node.host}`, err.message));

  client.on("raw", (d) => lavalink.sendRawData(d));

  await lavalink.init({
    id: botConfig.clientId,
    username: client.user?.username || "bot",
  });

  Logger.ready("Lavalink initialized");
  return lavalink;
}

function get() {
  return lavalink;
}

module.exports = { init, get };

//======================
// Created by monavia
// Don't change if you don't know
//======================
