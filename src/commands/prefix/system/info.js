const { EmbedBuilder } = require("discord.js");
const Colors = require("../../../core/constants/Colors");

module.exports = {
  name: "info",
  async execute(message, args) {
    const embed = new EmbedBuilder()
      .setTitle(message.client.user.username)
      .setDescription("A full-featured Discord bot with music playback (Lavalink), AI assistant, and more.")
      .addFields(
        { name: "Version", value: "2.0.0", inline: true },
        { name: "Library", value: "discord.js v14", inline: true },
        { name: "Music Engine", value: "Lavalink", inline: true },
        { name: "AI Engine", value: "Ollama (Local)", inline: true },
        { name: "Servers", value: String(message.client.guilds.cache.size), inline: true },
      )
      .setThumbnail(message.client.user.displayAvatarURL())
      .setColor(Colors.INFO);

    await message.channel.send({ embeds: [embed] });
  },
};
