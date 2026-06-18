const lavalink = require("./lavalink");

class Resolver {
  constructor(guildId) {
    this.guildId = guildId;
  }

  async search(query, user) {
    const node = lavalink.get()?.nodeManager?.getNode();
    if (!node) throw new Error("No Lavalink node available");
    return node.search({ query }, user);
  }
}

module.exports = Resolver;

//======================
// Created by monavia
// Don't change if you don't know
//======================
