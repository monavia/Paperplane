const Logger = require("../core/utils/Logger");

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    Logger.ready(`Logged in as ${client.user.tag}`);
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
