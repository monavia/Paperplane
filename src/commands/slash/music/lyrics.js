const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("../../../core/music/PlayerManager");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");
const Colors = require("../../../core/constants/Colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Show lyrics for the current track"),

  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    const track = player?.queue?.current;
    if (!track) return interaction.reply({ embeds: [ErrorEmbed.build("Nothing is playing.")], ephemeral: true });

    await interaction.deferReply();

    try {
      const lyrics = await player.getCurrentLyrics();
      if (!lyrics || !lyrics.lines?.length) {
        return interaction.editReply({ embeds: [ErrorEmbed.build("No lyrics found for this track.")] });
      }

      const title = track.info.title || "Unknown";
      const author = track.info.author || "Unknown";
      const text = lyrics.text || lyrics.lines.map(l => l.line).join("\n");
      const truncated = text.length > 4000 ? text.slice(0, 4000) + "\n*...*" : text;

      const embed = new EmbedBuilder()
        .setTitle(`${title} - ${author}`)
        .setDescription(truncated)
        .setFooter({ text: `Source: ${lyrics.sourceName || lyrics.provider || "Unknown"}` })
        .setColor(Colors.PRIMARY);

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ embeds: [ErrorEmbed.build("Failed to fetch lyrics.")] });
    }
  },
};
