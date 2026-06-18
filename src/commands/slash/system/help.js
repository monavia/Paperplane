const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Colors = require("../../../core/constants/Colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show available commands"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Help")
      .setDescription("Here are my available commands:")
      .addFields(
        {
          name: "🎵 Music",
          value: "`/play`, `/skip`, `/stop`, `/pause`, `/resume`, `/queue`, `/nowplaying`, `/volume`, `/shuffle`, `/loop`, `/seek`, `/autoplay`",
        },
        {
          name: "🤖 AI",
          value: "`/ask`, `/summarize`, `/imagine`, `/recommend`",
        },
        {
          name: "⚙️ System",
          value: "`/ping`, `/help`, `/info`, `/stats`, `/prefix`",
        },
      )
      .setColor(Colors.PRIMARY);

    await interaction.reply({ embeds: [embed] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
