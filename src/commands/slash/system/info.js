const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Colors = require("../../../core/constants/Colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Show bot information"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle(interaction.client.user.username)
      .setDescription("A full-featured Discord bot with music playback (Lavalink), AI assistant, and more.")
      .addFields(
        { name: "Version", value: "2.0.0", inline: true },
        { name: "Library", value: "discord.js v14", inline: true },
        { name: "Music Engine", value: "Lavalink", inline: true },
        { name: "AI Engine", value: "Ollama (Local)", inline: true },
        { name: "Servers", value: String(interaction.client.guilds.cache.size), inline: true },
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setColor(Colors.INFO);

    await interaction.reply({ embeds: [embed] });
  },
};
