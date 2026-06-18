const { SlashCommandBuilder } = require("discord.js");
const MusicService = require("../../../services/MusicService");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume playback"),

  async execute(interaction) {
    const voice = interaction.member.voice.channel;
    if (!voice) return interaction.reply({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")], ephemeral: true });

    const player = MusicService.getEngine(interaction.guildId).player;
    if (!player) return interaction.reply({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")], ephemeral: true });

    const resumed = await MusicService.resume(interaction.guildId);
    if (!resumed) return interaction.reply({ embeds: [ErrorEmbed.build("Gagal melanjutkan playback.")], ephemeral: true });

    await interaction.reply({ embeds: [SuccessEmbed.build("Playback dilanjutkan.")] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
