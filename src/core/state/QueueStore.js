class QueueStore {
  constructor() {
    this._queues = new Map();
  }

  get(guildId) {
    return this._queues.get(guildId) || [];
  }

  set(guildId, tracks) {
    this._queues.set(guildId, tracks);
  }

  add(guildId, track) {
    const queue = this.get(guildId);
    queue.push(track);
    this._queues.set(guildId, queue);
  }

  addMultiple(guildId, tracks) {
    const queue = this.get(guildId);
    queue.push(...tracks);
    this._queues.set(guildId, queue);
  }

  remove(guildId, index) {
    const queue = this.get(guildId);
    if (index < 0 || index >= queue.length) return null;
    return queue.splice(index, 1)[0];
  }

  clear(guildId) {
    this._queues.delete(guildId);
  }

  size(guildId) {
    return this.get(guildId).length;
  }

  has(guildId) {
    return this._queues.has(guildId);
  }
}

module.exports = QueueStore;

//======================
// Created by monavia
// Don't change if you don't know
//======================
