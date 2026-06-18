const { PermissionFlagsBits } = require("discord.js");
const botConfig = require("../../../config/bot");
const GuildRepository = require("../../../database/repositories/GuildRepository");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "prefix",
  async execute(message, args) {
    const guild = await GuildRepository.findByGuildId(message.guildId);
    const current = guild.prefix || botConfig.prefix;

    if (!args.length) {
      return message.channel.send({ embeds: [SuccessEmbed.build(`Prefix server ini: \`${current}\``)] });
    }

    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.channel.send({ embeds: [ErrorEmbed.build("Hanya admin yang bisa mengganti prefix.")] });
    }

    await GuildRepository.updatePrefix(message.guildId, args[0]);
    await message.channel.send({ embeds: [SuccessEmbed.build(`Prefix diganti menjadi \`${args[0]}\``)] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
