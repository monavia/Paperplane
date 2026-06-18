const { SlashCommandBuilder } = require("discord.js");
const AIService = require("../../../services/AIService");
const AIEmbed = require("../../../ui/embeds/AIEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask the AI assistant something")
    .addStringOption((o) => o.setName("prompt").setDescription("Your question").setRequired(true)),

  async execute(interaction) {
    const prompt = interaction.options.getString("prompt");

    await interaction.deferReply();

    try {
      const answer = await AIService.ask(interaction.user.id, prompt);
      await interaction.editReply({ embeds: [AIEmbed.build(prompt, answer)] });
    } catch (err) {
      await interaction.editReply({ embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};
