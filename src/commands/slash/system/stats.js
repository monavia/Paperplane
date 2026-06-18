const { SlashCommandBuilder } = require("discord.js");
const StatsEmbed = require("../../../ui/embeds/StatsEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show bot statistics"),

  async execute(interaction) {
    await interaction.reply({ embeds: [StatsEmbed.build(interaction.client)] });
  },
};
