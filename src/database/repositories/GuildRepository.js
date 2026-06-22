const Guild = require("../models/Guild");

const prefixCache = new Map();

class GuildRepository {
  async findByGuildId(guildId) {
    let guild = await Guild.findOne({ guildId });
    if (!guild) {
      guild = await Guild.create({ guildId });
    }
    if (prefixCache.has(guildId)) {
      guild.prefix = prefixCache.get(guildId);
    }
    return guild;
  }

  async getPrefix(guildId) {
    if (prefixCache.has(guildId)) return prefixCache.get(guildId);
    const guild = await Guild.findOne({ guildId });
    if (guild && guild.prefix) {
      prefixCache.set(guildId, guild.prefix);
      return guild.prefix;
    }
    return null;
  }

  async updatePrefix(guildId, prefix) {
    const result = await Guild.findOneAndUpdate(
      { guildId },
      { $set: { prefix, updatedAt: Date.now() } },
      { upsert: true, new: true },
    );
    prefixCache.set(guildId, prefix);
    return result;
  }

  async updateVolume(guildId, volume) {
    return Guild.findOneAndUpdate({ guildId }, { $set: { volume, updatedAt: Date.now() } }, { upsert: true, new: true });
  }

  async updateDjRole(guildId, roleId) {
    return Guild.findOneAndUpdate({ guildId }, { $set: { djRole: roleId, updatedAt: Date.now() } }, { upsert: true, new: true });
  }

  async updateSettings(guildId, settings) {
    return Guild.findOneAndUpdate({ guildId }, { $set: { ...settings, updatedAt: Date.now() } }, { upsert: true, new: true });
  }

  async deleteGuild(guildId) {
    prefixCache.delete(guildId);
    return Guild.deleteOne({ guildId });
  }

  invalidateCache(guildId) {
    prefixCache.delete(guildId);
  }
}

module.exports = new GuildRepository();

//======================
// Created by monavia
// Don't change if you don't know
//======================
