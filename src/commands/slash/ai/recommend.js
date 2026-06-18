const { SlashCommandBuilder } = require("discord.js");
const AIService = require("../../../services/AIService");
const AIEmbed = require("../../../ui/embeds/AIEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("recommend")
    .setDescription("Get music recommendations")
    .addStringOption((o) => o.setName("taste").setDescription("Describe your music taste").setRequired(true)),

  async execute(interaction) {
    const taste = interaction.options.getString("taste");

    await interaction.deferReply();

    try {
      const recs = await AIService.recommend(taste);
      await interaction.editReply({ embeds: [AIEmbed.build(`Recommendations for: ${taste}`, recs)] });
    } catch (err) {
      await interaction.editReply({ embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};
