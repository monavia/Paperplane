const { Events } = require("discord.js");
const Logger = require("../core/utils/Logger");

module.exports = {
  name: Events.Error,
  async execute(error) {
    Logger.error("Client error:", error.message);
  },
};
