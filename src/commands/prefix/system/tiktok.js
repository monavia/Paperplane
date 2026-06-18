const TikTokService = require("../../../services/TikTokService");
const TikTokEmbed = require("../../../ui/embeds/TikTokEmbed");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "tiktok",
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === "list") {
      const entries = await TikTokService.getTracks(message.guildId);
      return message.channel.send({ embeds: [TikTokEmbed.trackedList(entries)] });
    }

    if (sub === "add") {
      const username = args[1];
      if (!username) return message.channel.send({ embeds: [ErrorEmbed.build("Usage: `!tiktok add <username>`")] });

      const result = await TikTokService.addTrack(message.guildId, message.channelId, username);
      const msg = result.new ? `Now tracking @${result.username}` : `Updated notification channel for @${result.username}`;
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
