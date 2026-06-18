const { SlashCommandBuilder } = require("discord.js");
const MusicService = require("../../../services/MusicService");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current track"),

  async execute(interaction) {
    const voice = interaction.member.voice.channel;
    if (!voice) return interaction.reply({ embeds: [ErrorEmbed.build("You must be in a voice channel.")], ephemeral: true });

    try {
      await MusicService.skip(interaction.guildId);
      await interaction.reply({ embeds: [SuccessEmbed.build("Skipped to next track.")] });
    } catch (err) {
      await interaction.reply({ embeds: [ErrorEmbed.build(err.message)], ephemeral: true });
    }
  },
};
