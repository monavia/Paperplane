class IPC {
  constructor() {
    this._handlers = new Map();
  }

  on(event, handler) {
    if (!this._handlers.has(event)) this._handlers.set(event, []);
    this._handlers.get(event).push(handler);
  }

  emit(event, data) {
    const handlers = this._handlers.get(event) || [];
    for (const handler of handlers) handler(data);
  }

  broadcast(event, data) {
    if (process.send) process.send({ event, data });
  }
}

module.exports = new IPC();

//======================
// Created by monavia
// Don't change if you don't know
//======================
