const { SlashCommandBuilder } = require("discord.js");
const AIService = require("../../../services/AIService");
const AIEmbed = require("../../../ui/embeds/AIEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("summarize")
    .setDescription("Summarize a block of text")
    .addStringOption((o) => o.setName("text").setDescription("Text to summarize").setRequired(true)),

  async execute(interaction) {
    const text = interaction.options.getString("text");

    await interaction.deferReply();

    try {
      const summary = await AIService.summarize(text);
      await interaction.editReply({ embeds: [AIEmbed.build("Summary", summary)] });
    } catch (err) {
      await interaction.editReply({ embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
