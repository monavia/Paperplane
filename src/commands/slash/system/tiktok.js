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
      sub.setName("channel").setDescription("Set notification channel for TikTok live alerts")
        .addChannelOption((o) => o.setName("channel").setDescription("Channel untuk notifikasi").setRequired(true)),
    )
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
      const channelId = await TikTokService.getChannel(interaction.guildId);
      const channel = channelId ? interaction.guild.channels.cache.get(channelId) : null;
      return interaction.reply({ embeds: [TikTokEmbed.trackedList(entries, channel, "/")] });
    }

    if (sub === "channel") {
      const targetChannel = interaction.options.getChannel("channel");
      await TikTokService.setChannel(interaction.guildId, targetChannel.id);
      return interaction.reply({ embeds: [SuccessEmbed.build(`Notifikasi TikTok akan dikirim ke ${targetChannel}`)] });
    }

    if (sub === "add") {
      const username = interaction.options.getString("username");
      try {
        const result = await TikTokService.addTrack(interaction.guildId, username);
        const msg = result.new
          ? `Now tracking @${result.username}`
          : `Updated tracking for @${result.username}`;
        return interaction.reply({ embeds: [SuccessEmbed.build(msg)] });
      } catch (err) {
        return interaction.reply({ embeds: [ErrorEmbed.build(err.message)] });
      }
    }

    if (sub === "remove") {
      const username = interaction.options.getString("username");
      const removed = await TikTokService.removeTrack(interaction.guildId, username);
      if (!removed) return interaction.reply({ embeds: [ErrorEmbed.build("That user is not being tracked.")] });
      return interaction.reply({ embeds: [SuccessEmbed.build(`Stopped tracking @${username.replace(/^@/, "")}`)] });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
