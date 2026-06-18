const QueueEngine = require("./QueueEngine");
const PlaybackEngine = require("./PlaybackEngine");
const { getPlayer, createPlayer } = require("./PlayerManager");

class MusicEngine {
  constructor(guildId) {
    this.guildId = guildId;
    this.queue = new QueueEngine(guildId);
    this.playback = new PlaybackEngine(guildId);
  }

  get player() {
    return getPlayer(this.guildId);
  }

  async join(voiceChannelId, textChannelId) {
    return createPlayer(this.guildId, voiceChannelId, textChannelId);
  }

  async disconnect() {
    const player = this.player;
    if (player) {
      this.queue.clear();
      await player.stopPlaying();
      player.disconnect();
      player.destroy();
    }
  }

  isPlaying() {
    return this.player?.playing || false;
  }

  isPaused() {
    return this.player?.paused || false;
  }

  getCurrentTrack() {
    return this.player?.queue.current || null;
  }
}

module.exports = MusicEngine;

//======================
// Created by monavia
// Don't change if you don't know
//======================
