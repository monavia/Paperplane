const { SlashCommandBuilder } = require("discord.js");
const PingEmbed = require("../../../ui/embeds/PingEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency"),

  async execute(interaction) {
    const sent = await interaction.reply({ content: "Pinging...", fetchReply: true });
    const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = interaction.client.ws.ping;

    await interaction.editReply({
      content: null,
      embeds: [PingEmbed.build(botLatency, apiLatency)],
    });
  },
};
