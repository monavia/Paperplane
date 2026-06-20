const { SlashCommandBuilder } = require("discord.js");
const MusicService = require("../../../services/MusicService");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause playback"),

  async execute(interaction) {
    const voice = interaction.member.voice.channel;
    if (!voice) return interaction.reply({ embeds: [ErrorEmbed.build("You must be in a voice channel.")], ephemeral: true });

    const player = MusicService.getEngine(interaction.guildId).player;
    if (!player) return interaction.reply({ embeds: [ErrorEmbed.build("No track is currently playing.")], ephemeral: true });

    const paused = await MusicService.pause(interaction.guildId);
    if (!paused) return interaction.reply({ embeds: [ErrorEmbed.build("Failed to pause playback.")], ephemeral: true });

    await interaction.reply({ embeds: [SuccessEmbed.build("Playback paused.")] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
