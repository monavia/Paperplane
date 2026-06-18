const { SlashCommandBuilder } = require("discord.js");
const AIService = require("../../../services/AIService");
const AIEmbed = require("../../../ui/embeds/AIEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("imagine")
    .setDescription("Generate an image from a description")
    .addStringOption((o) => o.setName("idea").setDescription("Describe what to generate").setRequired(true)),

  async execute(interaction) {
    const idea = interaction.options.getString("idea");

    await interaction.deferReply();

    try {
      const dallePrompt = await AIService.imagine(idea);
      await interaction.editReply({ embeds: [AIEmbed.build(`Imagine: ${idea}`, dallePrompt)] });
    } catch (err) {
      await interaction.editReply({ embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};
