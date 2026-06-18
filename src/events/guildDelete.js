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
