const { SlashCommandBuilder } = require("discord.js");
const MusicService = require("../../../services/MusicService");
const NowPlayingEmbed = require("../../../ui/embeds/NowPlayingEmbed");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song or add to queue")
    .addStringOption((o) => o.setName("query").setDescription("Song name or URL").setRequired(true)),

  async execute(interaction) {
    const query = interaction.options.getString("query");
    const voice = interaction.member.voice.channel;
    if (!voice) return interaction.reply({ embeds: [ErrorEmbed.build("You must be in a voice channel.")], ephemeral: true });

    await interaction.deferReply();

    try {
      const { engine, result, track } = await MusicService.play(interaction.guildId, voice.id, interaction.channelId, query, interaction.user);

      if (result.loadType === "playlist") {
        await interaction.editReply({ embeds: [SuccessEmbed.build(`Added ${result.tracks.length} tracks to the queue.`)] });
      } else {
        await interaction.editReply({
          embeds: [NowPlayingEmbed.build(track, engine.player)],
        });
      }
    } catch (err) {
      await interaction.editReply({ embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};
