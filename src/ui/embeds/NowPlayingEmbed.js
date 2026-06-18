const { EmbedBuilder } = require("discord.js");
const Colors = require("../../core/constants/Colors");
const Emojis = require("../../core/constants/Emojis");

function build(track, player) {
  return new EmbedBuilder()
    .setDescription(`Added [${track.info.title || "Unknown"}](${track.info.uri || ""})`)
    .setColor(Colors.NOWPLAYING);
}

function addedToQueue(track, position) {
  return new EmbedBuilder()
    .setDescription(`[${track.info.title || "Unknown"}](${track.info.uri || ""})`)
    .addFields(
      { name: "Position in Queue", value: String(position || 1), inline: true },
    )
    .setColor(Colors.SUCCESS);
}

module.exports = { build, addedToQueue };
