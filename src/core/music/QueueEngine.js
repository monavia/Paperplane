const state = require("../state/StateManager");
const musicConfig = require("../../config/music");

class QueueEngine {
  constructor(guildId) {
    this.guildId = guildId;
  }

  add(track) {
    if (state.queues.size(this.guildId) >= musicConfig.maxQueueSize) return false;
    state.queues.add(this.guildId, track);
    return true;
  }

  addMultiple(tracks) {
    const space = musicConfig.maxQueueSize - state.queues.size(this.guildId);
    if (space <= 0) return 0;
    const allowed = tracks.slice(0, space);
    state.queues.addMultiple(this.guildId, allowed);
    return allowed.length;
  }

  next() {
    const queue = state.queues.get(this.guildId);
    if (!queue.length) return null;
    const track = queue.shift();
    state.queues.set(this.guildId, queue);
    return track;
  }

  peek(index = 0) {
    const queue = state.queues.get(this.guildId);
    return queue[index] || null;
  }

  remove(index) {
    return state.queues.remove(this.guildId, index);
  }

  clear() {
    state.queues.clear(this.guildId);
  }

  getAll() {
    return state.queues.get(this.guildId);
  }

  size() {
    return state.queues.size(this.guildId);
  }

  shuffle() {
    const queue = state.queues.get(this.guildId);
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    state.queues.set(this.guildId, queue);
  }
}

module.exports = QueueEngine;

//======================
// Created by monavia
// Don't change if you don't know
//======================
