const { EmbedBuilder } = require("discord.js");
const Colors = require("../../core/constants/Colors");
const Emojis = require("../../core/constants/Emojis");

function build(botLatency, apiLatency) {
  return new EmbedBuilder()
    .setTitle(`${Emojis.PING} Pong!`)
    .addFields(
      { name: "Bot Latency", value: `\`${botLatency}ms\``, inline: true },
      { name: "API Latency", value: `\`${apiLatency}ms\``, inline: true },
    )
    .setColor(Colors.PING)
    .setFooter({ text: `Round-trip • ${botLatency + apiLatency}ms total` });
}

module.exports = { build };

//======================
// Created by monavia
// Don't change if you don't know
//======================
