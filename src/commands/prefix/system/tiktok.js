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
      return message.channel.send({ embeds: [TikTokEmbed.trackedList(entries, botConfig.prefix)] });
    }

    if (sub === "add") {
      const username = args[1];
      const targetChannel = message.mentions.channels.first();
      if (!username || !targetChannel) return message.channel.send({ embeds: [ErrorEmbed.build("Usage: `!tiktok add <username> #channel`")] });

      const result = await TikTokService.addTrack(message.guildId, targetChannel.id, username);
      const msg = result.new
        ? `Now tracking @${result.username} → ${targetChannel}`
        : `Updated notification channel for @${result.username} → ${targetChannel}`;
      return message.channel.send({ embeds: [SuccessEmbed.build(msg)] });
    }

    if (sub === "remove") {
      const username = args[1];
      if (!username) return message.channel.send({ embeds: [ErrorEmbed.build("Usage: `!tiktok remove <username>`")] });

      const removed = await TikTokService.removeTrack(message.guildId, username);
      if (!removed) return message.channel.send({ embeds: [ErrorEmbed.build("That user is not being tracked.")] });
      return message.channel.send({ embeds: [SuccessEmbed.build(`Stopped tracking @${username.replace(/^@/, "")}`)] });
    }

    message.channel.send({ embeds: [ErrorEmbed.build("Unknown subcommand. Use: `add`, `remove`, `list`")] });
  },
};
