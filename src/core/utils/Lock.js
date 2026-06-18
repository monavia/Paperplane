class Lock {
  constructor() {
    this._locked = new Set();
  }

  has(key) {
    return this._locked.has(key);
  }

  acquire(key) {
    if (this._locked.has(key)) return false;
    this._locked.add(key);
    return true;
  }

  release(key) {
    this._locked.delete(key);
  }

  async waitAndAcquire(key, timeout = 10000) {
    const start = Date.now();
    while (this._locked.has(key)) {
      if (Date.now() - start > timeout) return false;
      await new Promise((r) => setTimeout(r, 50));
    }
    this._locked.add(key);
    return true;
  }
}

module.exports = Lock;
