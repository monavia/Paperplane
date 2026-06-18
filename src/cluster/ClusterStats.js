class ClusterStats {
  constructor() {
    this._stats = { guilds: 0, users: 0, memory: 0, uptime: 0 };
  }

  update(data) {
    Object.assign(this._stats, data);
  }

  get() {
    return { ...this._stats };
  }
}

module.exports = new ClusterStats();

//======================
// Created by monavia
// Don't change if you don't know
//======================
