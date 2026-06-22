const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const botConfig = require("../../../config/bot");
const GuildRepository = require("../../../database/repositories/GuildRepository");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("prefix")
    .setDescription("Show or change the command prefix")
    .addStringOption((o) => o.setName("new_prefix").setDescription("New prefix character")),

  async execute(interaction) {
    const newPrefix = interaction.options.getString("new_prefix");

    const guild = await GuildRepository.findByGuildId(interaction.guildId);
    const current = guild.prefix || botConfig.prefix;

    if (!newPrefix) {
      return interaction.reply({ embeds: [SuccessEmbed.build(`Current prefix: \`${current}\``)] });
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ embeds: [ErrorEmbed.build("You need `Administrator` permission.")], ephemeral: true });
    }

    if (newPrefix.length > 3) {
      return interaction.reply({ embeds: [ErrorEmbed.build("Prefix must be 1-3 characters.")], ephemeral: true });
    }

    await GuildRepository.updatePrefix(interaction.guildId, newPrefix);
    await interaction.reply({ embeds: [SuccessEmbed.build(`Prefix changed to \`${newPrefix}\``)] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
