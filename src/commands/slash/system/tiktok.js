const { SlashCommandBuilder } = require("discord.js");
const TikTokService = require("../../../services/TikTokService");
const TikTokEmbed = require("../../../ui/embeds/TikTokEmbed");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tiktok")
    .setDescription("Manage TikTok live notifications")
    .addSubcommand((sub) =>
      sub.setName("add").setDescription("Track a TikTok user")
        .addStringOption((o) => o.setName("username").setDescription("TikTok username or URL").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub.setName("remove").setDescription("Stop tracking a TikTok user")
        .addStringOption((o) => o.setName("username").setDescription("TikTok username or URL").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("Show tracked TikTok users"),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "list") {
      const entries = await TikTokService.getTracks(interaction.guildId);
      return interaction.reply({ embeds: [TikTokEmbed.trackedList(entries)] });
    }

    if (sub === "add") {
      const username = interaction.options.getString("username");
      const result = await TikTokService.addTrack(interaction.guildId, interaction.channelId, username);
      const msg = result.new ? `Now tracking @${result.username}` : `Updated notification channel for @${result.username}`;
      return interaction.reply({ embeds: [SuccessEmbed.build(msg)] });
    }

    if (sub === "remove") {
      const username = interaction.options.getString("username");
      const removed = await TikTokService.removeTrack(interaction.guildId, username);
      if (!removed) return interaction.reply({ embeds: [ErrorEmbed.build("That user is not being tracked.")] });
      return interaction.reply({ embeds: [SuccessEmbed.build(`Stopped tracking @${username.replace(/^@/, "")}`)] });
    }
  },
};
