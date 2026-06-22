const { SlashCommandBuilder } = require("discord.js");
const { getPlayer } = require("../../../core/music/PlayerManager");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");
const MusicModes = require("../../../core/constants/MusicModes");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Set loop mode")
    .addStringOption((o) =>
      o.setName("mode")
        .setDescription("Loop mode")
        .setRequired(true)
        .addChoices(
          { name: "Off", value: "none" },
          { name: "Track", value: "track" },
          { name: "Queue", value: "queue" },
        ),
    ),

  async execute(interaction) {
    const mode = interaction.options.getString("mode");
    const player = getPlayer(interaction.guildId);
    if (!player) return interaction.reply({ embeds: [ErrorEmbed.build("No active player.")], ephemeral: true });

    await player.setRepeatMode(mode);
    await interaction.reply({ embeds: [SuccessEmbed.build(`Loop mode set to \`${mode}\`.`)] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
