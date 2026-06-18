const state = require("../state/StateManager");

class AutoplayEngine {
  constructor(guildId) {
    this.guildId = guildId;
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  async getNextTrack(currentTrack) {
    if (!this.enabled || !currentTrack) return null;
    return null;
  }
}

module.exports = AutoplayEngine;

//======================
// Created by monavia
// Don't change if you don't know
//======================
