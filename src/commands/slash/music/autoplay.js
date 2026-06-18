const { SlashCommandBuilder } = require("discord.js");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autoplay")
    .setDescription("Toggle autoplay for similar tracks"),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const engine = require("../../../services/MusicService").getEngine(guildId);
    if (!engine) return interaction.reply({ embeds: [ErrorEmbed.build("No active player.")], ephemeral: true });

    engine.playback.autoplay = !engine.playback.autoplay;
    const status = engine.playback.autoplay ? "enabled" : "disabled";
    await interaction.reply({ embeds: [SuccessEmbed.build(`Autoplay ${status}.`)] });
  },
};
