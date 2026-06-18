const { SlashCommandBuilder } = require("discord.js");
const MusicService = require("../../../services/MusicService");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the queue"),

  async execute(interaction) {
    const voice = interaction.member.voice.channel;
    if (!voice) return interaction.reply({ embeds: [ErrorEmbed.build("You must be in a voice channel.")], ephemeral: true });

    const tracks = MusicService.getQueue(interaction.guildId);
    if (!tracks?.length) return interaction.reply({ embeds: [ErrorEmbed.build("Queue is empty.")], ephemeral: true });

    MusicService.shuffle(interaction.guildId);
    await interaction.reply({ embeds: [SuccessEmbed.build(`Queue shuffled (${tracks.length} tracks).`)] });
  },
};
