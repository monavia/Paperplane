const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const botConfig = require("../../../config/bot");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("prefix")
    .setDescription("Show or change the command prefix")
    .addStringOption((o) => o.setName("new_prefix").setDescription("New prefix character")),

  async execute(interaction) {
    const newPrefix = interaction.options.getString("new_prefix");

    if (!newPrefix) {
      return interaction.reply({ embeds: [SuccessEmbed.build(`Current prefix: \`${botConfig.prefix}\``)] });
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ embeds: [ErrorEmbed.build("You need `Manage Server` permission.")], ephemeral: true });
    }

    botConfig.prefix = newPrefix;
    await interaction.reply({ embeds: [SuccessEmbed.build(`Prefix changed to \`${newPrefix}\``)] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
