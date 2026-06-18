const { EmbedBuilder } = require("discord.js");
const Colors = require("../../core/constants/Colors");
const Emojis = require("../../core/constants/Emojis");
const { formatTrack } = require("../../core/utils/Formatter");

function build(tracks, page = 1) {
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(tracks.length / perPage));
  const start = (page - 1) * perPage;
  const slice = tracks.slice(start, start + perPage);

  const desc = slice.length
    ? slice.map((t, i) => formatTrack(t, start + i + 1)).join("\n")
    : "The queue is empty.";

  return new EmbedBuilder()
    .setTitle(`${Emojis.QUEUE} Music Queue`)
    .setDescription(desc)
    .setColor(Colors.PRIMARY)
    .setFooter({ text: `Page ${page}/${totalPages} • ${tracks.length} tracks • ${tracks.length * 4} min total` });
}

module.exports = { build };
