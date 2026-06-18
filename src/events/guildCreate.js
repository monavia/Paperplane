const { Events } = require("discord.js");
const Logger = require("../core/utils/Logger");

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    Logger.info(`Joined guild: ${guild.name} (${guild.id})`);
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
