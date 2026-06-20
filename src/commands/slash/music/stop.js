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
    if (!voice) return interaction.reply({ embeds: [ErrorEmbed.build("You must be in a voice channel.")], ephemeral: true });

    const player = MusicService.getEngine(interaction.guildId).player;
    if (!player) return interaction.reply({ embeds: [ErrorEmbed.build("No track is currently playing.")], ephemeral: true });

    try {
      const hadTracks = !!(player.playing || player.paused || MusicService.getQueue(interaction.guildId)?.length);
      await interaction.deferReply();
      await MusicService.stop(interaction.guildId);

      if (!hadTracks) {
        await interaction.editReply({ embeds: [SuccessEmbed.build("Queue empty.")] });
      } else {
        await interaction.editReply({ embeds: [SuccessEmbed.build("Thank you for using our service!")] });
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
