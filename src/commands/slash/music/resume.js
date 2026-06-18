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
    if (!voice) return interaction.reply({ embeds: [ErrorEmbed.build("You must be in a voice channel.")], ephemeral: true });

    const resumed = await MusicService.resume(interaction.guildId);
    if (!resumed) return interaction.reply({ embeds: [ErrorEmbed.build("Nothing to resume.")], ephemeral: true });

    await interaction.reply({ embeds: [SuccessEmbed.build("Playback resumed.")] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
