const { SlashCommandBuilder } = require("discord.js");
const MusicService = require("../../../services/MusicService");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playback and clear the queue"),

  async execute(interaction) {
    const voice = interaction.member.voice.channel;
    if (!voice) return interaction.reply({ embeds: [ErrorEmbed.build("You must be in a voice channel.")], ephemeral: true });

    try {
      await MusicService.stop(interaction.guildId);
      await interaction.reply({ embeds: [SuccessEmbed.build("Stopped playback and disconnected from voice.")] });
    } catch (err) {
      await interaction.reply({ embeds: [ErrorEmbed.build(err.message)], ephemeral: true });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
