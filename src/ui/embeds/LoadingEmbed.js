const { EmbedBuilder } = require("discord.js");
const Colors = require("../../core/constants/Colors");

function build(text) {
  return new EmbedBuilder()
    .setDescription(text)
    .setColor(Colors.INFO);
}

module.exports = { build };

//======================
// Created by monavia
// Don't change if you don't know
//======================
