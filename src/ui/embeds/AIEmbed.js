const { EmbedBuilder } = require("discord.js");
const Colors = require("../../core/constants/Colors");
const Emojis = require("../../core/constants/Emojis");

function build(prompt, answer) {
  const truncated = answer.length > 2000 ? answer.slice(0, 1997) + "..." : answer;
  return new EmbedBuilder()
    .setAuthor({ name: "AI Assistant", iconURL: "https://cdn.discordapp.com/emojis/1051582482056618105.png" })
    .setDescription(truncated)
    .setColor(Colors.AI)
    .setFooter({ text: `Prompt: ${prompt.slice(0, 80)}` });
}

module.exports = { build };
