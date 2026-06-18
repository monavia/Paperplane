const { SlashCommandBuilder } = require("discord.js");
const MusicService = require("../../../services/MusicService");
const { formatVolume } = require("../../../core/utils/Formatter");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set playback volume")
    .addIntegerOption((o) =>
      o.setName("level").setDescription("Volume 1-100").setMinValue(1).setMaxValue(100).setRequired(true),
    ),

  async execute(interaction) {
    const volume = interaction.options.getInteger("level");
    const voice = interaction.member.voice.channel;
    if (!voice) return interaction.reply({ embeds: [ErrorEmbed.build("You must be in a voice channel.")], ephemeral: true });

    MusicService.setVolume(interaction.guildId, volume);
    await interaction.reply({ embeds: [SuccessEmbed.build(`Volume set to ${formatVolume(volume)}`)] });
  },
};
