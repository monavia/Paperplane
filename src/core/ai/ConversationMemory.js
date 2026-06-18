class ConversationMemory {
  constructor() {
    this._sessions = new Map();
  }

  getHistory(userId) {
    return this._sessions.get(userId) || [];
  }

  add(userId, prompt, response) {
    if (!this._sessions.has(userId)) this._sessions.set(userId, []);
    const session = this._sessions.get(userId);
    session.push({ user: prompt, assistant: response, timestamp: Date.now() });
    if (session.length > 20) session.splice(0, session.length - 20);
  }

  clear(userId) {
    this._sessions.delete(userId);
  }

  hasHistory(userId) {
    return this._sessions.has(userId) && this._sessions.get(userId).length > 0;
  }
}

module.exports = ConversationMemory;
