const state = require("../state/StateManager");
const { getPlayer, createPlayer } = require("./PlayerManager");
const Logger = require("../utils/Logger");

class PlaybackEngine {
  constructor(guildId) {
    this.guildId = guildId;
    this.loopMode = "none";
    this.autoplay = false;
  }

  async play(track) {
    const player = getPlayer(this.guildId) || createPlayer(this.guildId, null, null);
    if (!player) return false;

    state.nowPlaying.set(this.guildId, track);
    await player.play({ track, clientTrack: track });
    return true;
  }

  async skip() {
    const player = getPlayer(this.guildId);
    if (!player) return false;
    await player.stopPlaying();
    return true;
  }

  async stop() {
    const player = getPlayer(this.guildId);
    if (!player) return false;
    state.nowPlaying.delete(this.guildId);
    state.queues.clear(this.guildId);
    await player.stopPlaying();
    return true;
  }

  async pause() {
    const player = getPlayer(this.guildId);
    if (!player || !player.playing) return false;
    await player.pause();
    return true;
  }

  async resume() {
    const player = getPlayer(this.guildId);
    if (!player || player.playing) return false;
    await player.resume();
    return true;
  }

  setVolume(volume) {
    const player = getPlayer(this.guildId);
    if (!player) return false;
    player.setVolume(volume);
    return true;
  }

  getVolume() {
    const player = getPlayer(this.guildId);
    return player?.volume || 0;
  }

  seek(position) {
    const player = getPlayer(this.guildId);
    if (!player) return false;
    player.seek(position);
    return true;
  }

  getPosition() {
    const player = getPlayer(this.guildId);
    return player?.position || 0;
  }
}

module.exports = PlaybackEngine;

//======================
// Created by monavia
// Don't change if you don't know
//======================
