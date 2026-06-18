const TikTokService = require("../../../services/TikTokService");
const TikTokEmbed = require("../../../ui/embeds/TikTokEmbed");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");
const botConfig = require("../../../config/bot");

module.exports = {
  name: "tiktok",
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === "list") {
      const entries = await TikTokService.getTracks(message.guildId);
      const channelId = await TikTokService.getChannel(message.guildId);
      const channel = channelId ? message.guild.channels.cache.get(channelId) : null;
      return message.channel.send({ embeds: [TikTokEmbed.trackedList(entries, channel, botConfig.prefix)] });
    }

    if (sub === "channel") {
      const targetChannel = message.mentions.channels.first();
      if (!targetChannel) return message.channel.send({ embeds: [ErrorEmbed.build("Usage: `!tiktok channel #channel`")] });

      await TikTokService.setChannel(message.guildId, targetChannel.id);
      return message.channel.send({ embeds: [SuccessEmbed.build(`Notifikasi TikTok akan dikirim ke ${targetChannel}`)] });
    }

    if (sub === "add") {
      const username = args[1];
      if (!username) return message.channel.send({ embeds: [ErrorEmbed.build("Usage: `!tiktok add <username>`")] });

      try {
        const result = await TikTokService.addTrack(message.guildId, username);
        const msg = result.new
          ? `Now tracking @${result.username}`
          : `Updated tracking for @${result.username}`;
        return message.channel.send({ embeds: [SuccessEmbed.build(msg)] });
      } catch (err) {
        return message.channel.send({ embeds: [ErrorEmbed.build(err.message)] });
      }
    }

    if (sub === "remove") {
      const username = args[1];
      if (!username) return message.channel.send({ embeds: [ErrorEmbed.build("Usage: `!tiktok remove <username>`")] });

      const removed = await TikTokService.removeTrack(message.guildId, username);
      if (!removed) return message.channel.send({ embeds: [ErrorEmbed.build("That user is not being tracked.")] });
      return message.channel.send({ embeds: [SuccessEmbed.build(`Stopped tracking @${username.replace(/^@/, "")}`)] });
    }

    message.channel.send({ embeds: [ErrorEmbed.build("Unknown subcommand. Use: `channel`, `add`, `remove`, `list`")] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
