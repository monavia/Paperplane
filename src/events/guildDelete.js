const { Events } = require("discord.js");
const Logger = require("../core/utils/Logger");
const GuildRepository = require("../database/repositories/GuildRepository");
const { destroyEngine } = require("../services/MusicService");

module.exports = {
  name: Events.GuildDelete,
  async execute(guild) {
    Logger.info(`Left guild: ${guild.name} (${guild.id})`);
    const { sendInfo } = require("../core/utils/ErrorReporter");
    sendInfo("Left server", `**${guild.name}** (\`${guild.id}\`) — bot removed or server deleted`);
    await destroyEngine(guild.id);
    await GuildRepository.deleteGuild(guild.id);
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
