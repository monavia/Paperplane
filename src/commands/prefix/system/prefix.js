const { PermissionFlagsBits } = require("discord.js");
const botConfig = require("../../../config/bot");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "prefix",
  async execute(message, args) {
    if (!args.length) {
      return message.channel.send({ embeds: [SuccessEmbed.build(`Current prefix: \`${botConfig.prefix}\``)] });
    }

    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.channel.send({ embeds: [ErrorEmbed.build("You need `Manage Server` permission.")] });
    }

    botConfig.prefix = args[0];
    await message.channel.send({ embeds: [SuccessEmbed.build(`Prefix changed to \`${args[0]}\``)] });
  },
};
