const QueueStore = require("./QueueStore");
const NowPlayingStore = require("./NowPlayingStore");

class StateManager {
  constructor() {
    this.queues = new QueueStore();
    this.nowPlaying = new NowPlayingStore();
  }
}

module.exports = new StateManager();

//======================
// Created by monavia
// Don't change if you don't know
//======================
