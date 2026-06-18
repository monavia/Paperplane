const MusicService = require("../../../services/MusicService");
const { formatVolume } = require("../../../core/utils/Formatter");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "volume",
  async execute(message, args) {
    const voice = message.member.voice.channel;
    if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });

    const level = parseInt(args[0]);
    if (isNaN(level) || level < 1 || level > 100) return message.channel.send({ embeds: [ErrorEmbed.build("Volume must be 1-100.")] });

    MusicService.setVolume(message.guildId, level);
    await message.channel.send({ embeds: [SuccessEmbed.build(`Volume set to ${formatVolume(level)}`)] });
  },
};
