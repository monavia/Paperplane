const { Events } = require("discord.js");
const Logger = require("../core/utils/Logger");

module.exports = {
  name: Events.Error,
  async execute(error) {
    Logger.error("Client error:", error.message);
    const { sendError } = require("../core/utils/ErrorReporter");
    sendError("Client error", `\`\`\`${error.message}\`\`\``);
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
