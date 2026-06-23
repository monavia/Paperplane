const { EmbedBuilder } = require("discord.js");
const { getPlayer } = require("../../../core/music/PlayerManager");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");
const Colors = require("../../../core/constants/Colors");

module.exports = {
  name: "lyrics",
  async execute(message, args) {
    const player = getPlayer(message.guildId);
    const track = player?.queue?.current;
    if (!track) return message.channel.send({ embeds: [ErrorEmbed.build("Nothing is playing.")] });

    const msg = await message.channel.send({ embeds: [new EmbedBuilder().setDescription("Fetching lyrics...").setColor(Colors.INFO)] });

    try {
      const lyrics = await player.getCurrentLyrics();
      if (!lyrics || !lyrics.lines?.length) {
        return msg.edit({ embeds: [ErrorEmbed.build("No lyrics found for this track.")] });
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

      await msg.edit({ embeds: [embed] });
    } catch (err) {
      await msg.edit({ embeds: [ErrorEmbed.build("Failed to fetch lyrics.")] });
    }
  },
};
