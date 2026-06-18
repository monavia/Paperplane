class NowPlayingStore {
  constructor() {
    this._nowPlaying = new Map();
  }

  get(guildId) {
    return this._nowPlaying.get(guildId) || null;
  }

  set(guildId, track) {
    this._nowPlaying.set(guildId, track);
  }

  delete(guildId) {
    this._nowPlaying.delete(guildId);
  }

  has(guildId) {
    return this._nowPlaying.has(guildId);
  }
}

module.exports = NowPlayingStore;

//======================
// Created by monavia
// Don't change if you don't know
//======================
