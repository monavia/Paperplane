class ConversationStore {
  constructor() {
    this._sessions = new Map();
  }

  get(key) {
    return this._sessions.get(key) || [];
  }

  add(key, message) {
    const session = this.get(key);
    session.push(message);
    if (session.length > 20) session.splice(0, session.length - 20);
    this._sessions.set(key, session);
  }

  clear(key) {
    this._sessions.delete(key);
  }

  has(key) {
    return this._sessions.has(key);
  }
}

module.exports = ConversationStore;
