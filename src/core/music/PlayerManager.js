const lavalink = require("./lavalink");
const musicConfig = require("../../config/music");

function getPlayer(guildId) {
  return lavalink.get()?.getPlayer(guildId);
}

async function createPlayer(guildId, voiceChannelId, textChannelId) {
  const nodeName = lavalink.getNextAvailableNode();
  const player = lavalink.get()?.createPlayer({
    guildId,
    voiceChannelId,
    textChannelId,
    selfDeaf: true,
    selfMute: false,
    volume: musicConfig.defaultVolume,
    node: nodeName,
  });
  if (player && voiceChannelId) {
    await player.connect();
    lavalink.cachePlayer(guildId, {
      voiceChannelId,
      textChannelId,
      currentTrack: null,
      position: 0,
      volume: musicConfig.defaultVolume,
    });
  }
  return player;
}

function destroyPlayer(guildId) {
  const player = getPlayer(guildId);
  if (player) {
    player.destroy();
    lavalink.uncachePlayer(guildId);
    return true;
  }
  return false;
}

function hasPlayer(guildId) {
  return !!getPlayer(guildId);
}

module.exports = { getPlayer, createPlayer, destroyPlayer, hasPlayer };

//======================
// Created by monavia
// Don't change if you don't know
//======================
