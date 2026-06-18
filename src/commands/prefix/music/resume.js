const MusicService = require("../../../services/MusicService");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "resume",
  async execute(message, args) {
    const voice = message.member.voice.channel;
    if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });

    const resumed = await MusicService.resume(message.guildId);
    if (!resumed) return message.channel.send({ embeds: [ErrorEmbed.build("Nothing to resume.")] });

    await message.channel.send({ embeds: [SuccessEmbed.build("Playback resumed.")] });
  },
};
