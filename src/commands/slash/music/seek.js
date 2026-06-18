const { SlashCommandBuilder } = require("discord.js");
const { getPlayer } = require("../../../core/music/PlayerManager");
const { parseTimestamp, parseDuration } = require("../../../core/utils/Duration");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Seek to a position in the current track")
    .addStringOption((o) => o.setName("position").setDescription("Position (e.g. 1:30 or 90)").setRequired(true)),

  async execute(interaction) {
    const posStr = interaction.options.getString("position");
    const player = getPlayer(interaction.guildId);
    if (!player || !player.queue.current) return interaction.reply({ embeds: [ErrorEmbed.build("Nothing is playing.")], ephemeral: true });

    const ms = parseTimestamp(posStr);
    if (isNaN(ms)) return interaction.reply({ embeds: [ErrorEmbed.build("Invalid time format. Use mm:ss or ss.")], ephemeral: true });

    if (ms > player.queue.current.info.duration) {
      return interaction.reply({ embeds: [ErrorEmbed.build("Position exceeds track duration.")], ephemeral: true });
    }

    player.seek(ms);
    await interaction.reply({ embeds: [SuccessEmbed.build(`Seeked to ${parseDuration(ms)}.`)] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
