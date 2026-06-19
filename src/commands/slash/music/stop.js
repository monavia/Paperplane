const { SlashCommandBuilder } = require("discord.js");
const MusicService = require("../../../services/MusicService");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playback (auto-disconnect after 3 menit)"),

  async execute(interaction) {
    const voice = interaction.member.voice.channel;
    if (!voice) return interaction.reply({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")], ephemeral: true });

    const player = MusicService.getEngine(interaction.guildId).player;
    if (!player) return interaction.reply({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")], ephemeral: true });

    const wasPlaying = player.playing || player.paused;

    try {
      if (wasPlaying) {
        await interaction.deferReply();
      }

      await MusicService.stop(interaction.guildId);

      if (!wasPlaying) {
        await interaction.reply({ embeds: [SuccessEmbed.build("Stopped.")] });
      } else {
        await interaction.deleteReply().catch(() => {});
      }
    } catch (err) {
      if (interaction.deferred) {
        await interaction.editReply({ embeds: [ErrorEmbed.build(err.message)] });
      } else {
        await interaction.reply({ embeds: [ErrorEmbed.build(err.message)], ephemeral: true });
      }
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
