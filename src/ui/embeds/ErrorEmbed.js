const { EmbedBuilder } = require("discord.js");
const Colors = require("../../core/constants/Colors");
const Emojis = require("../../core/constants/Emojis");

function build(text) {
  return new EmbedBuilder()
    .setDescription(`${Emojis.ERROR} ${text}`)
    .setColor(Colors.ERROR);
}

module.exports = { build };
