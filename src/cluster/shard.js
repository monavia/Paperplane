const Logger = require("../core/utils/Logger");

const shard = {
  id: process.env.CLUSTER_ID || "0",

  async broadcast(data) {
    Logger.debug(`Broadcasting from shard ${this.id}:`, data);
  },

  onMessage(callback) {
    process.on("message", (msg) => {
      if (msg) callback(msg);
    });
  },

  send(data) {
    if (process.send) process.send(data);
  },
};

module.exports = shard;
