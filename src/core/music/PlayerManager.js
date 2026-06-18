const lavalink = require("./lavalink");
const musicConfig = require("../../config/music");

function getPlayer(guildId) {
  return lavalink.get()?.getPlayer(guildId);
}

async function createPlayer(guildId, voiceChannelId, textChannelId) {
  const player = lavalink.get()?.createPlayer({
    guildId,
    voiceChannelId,
    textChannelId,
    selfDeaf: true,
    selfMute: false,
    volume: musicConfig.defaultVolume,
  });
  if (player && voiceChannelId) {
    await player.connect();
  }
  return player;
}

function destroyPlayer(guildId) {
  const player = getPlayer(guildId);
  if (player) {
    player.destroy();
    return true;
  }
  return false;
}

function hasPlayer(guildId) {
  return !!getPlayer(guildId);
}

module.exports = { getPlayer, createPlayer, destroyPlayer, hasPlayer };
