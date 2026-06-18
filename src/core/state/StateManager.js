const QueueStore = require("./QueueStore");
const NowPlayingStore = require("./NowPlayingStore");
const ConversationStore = require("./ConversationStore");

class StateManager {
  constructor() {
    this.queues = new QueueStore();
    this.nowPlaying = new NowPlayingStore();
    this.conversations = new ConversationStore();
  }
}

module.exports = new StateManager();
