const { EmbedBuilder } = require("discord.js");
const Colors = require("../../core/constants/Colors");
const Emojis = require("../../core/constants/Emojis");

function build(text) {
  return new EmbedBuilder()
    .setDescription(text)
    .setColor(Colors.SUCCESS);
}

module.exports = { build };
