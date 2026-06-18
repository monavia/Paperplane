const Guild = require("../models/Guild");

class GuildRepository {
  async findByGuildId(guildId) {
    let guild = await Guild.findOne({ guildId });
    if (!guild) {
      guild = await Guild.create({ guildId });
    }
    return guild;
  }

  async updatePrefix(guildId, prefix) {
    return Guild.findOneAndUpdate({ guildId }, { prefix, updatedAt: Date.now() }, { upsert: true });
  }

  async updateVolume(guildId, volume) {
    return Guild.findOneAndUpdate({ guildId }, { volume, updatedAt: Date.now() }, { upsert: true });
  }

  async updateDjRole(guildId, roleId) {
    return Guild.findOneAndUpdate({ guildId }, { djRole: roleId, updatedAt: Date.now() }, { upsert: true });
  }

  async updateSettings(guildId, settings) {
    return Guild.findOneAndUpdate({ guildId }, { ...settings, updatedAt: Date.now() }, { upsert: true });
  }

  async deleteGuild(guildId) {
    return Guild.deleteOne({ guildId });
  }
}

module.exports = new GuildRepository();
