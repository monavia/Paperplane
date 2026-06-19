const { SlashCommandBuilder } = require("discord.js");
const MusicService = require("../../../services/MusicService");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current track"),

  async execute(interaction) {
    const voice = interaction.member.voice.channel;
    if (!voice) return interaction.reply({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")], ephemeral: true });

    const player = MusicService.getEngine(interaction.guildId).player;
    if (!player) return interaction.reply({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")], ephemeral: true });

    try {
      await MusicService.skip(interaction.guildId);
    } catch (err) {
      await interaction.reply({ embeds: [ErrorEmbed.build(err.message)], ephemeral: true });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
