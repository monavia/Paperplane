const { Events } = require("discord.js");
const Logger = require("../core/utils/Logger");
const { destroyEngine } = require("../services/MusicService");

module.exports = {
  name: Events.GuildDelete,
  async execute(guild) {
    Logger.info(`Left guild: ${guild.name} (${guild.id})`);
    destroyEngine(guild.id);
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
