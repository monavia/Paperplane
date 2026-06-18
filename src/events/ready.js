const Logger = require("../core/utils/Logger");

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    Logger.ready(`Logged in as ${client.user.tag}`);
  },
};
