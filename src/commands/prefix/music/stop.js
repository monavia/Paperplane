const MusicService = require("../../../services/MusicService");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "stop",
  async execute(message, args) {
    const voice = message.member.voice.channel;
    if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")] });

    const engine = MusicService.getEngine(message.guildId);
    const player = engine?.player;
    if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")] });

    try {
      const hadTracks = !!(player.playing || player.paused || MusicService.getQueue(message.guildId)?.length);
      await MusicService.stop(message.guildId);

      if (!hadTracks) {
        return message.channel.send({ embeds: [SuccessEmbed.build("Queue empty.")] });
      }
      return message.channel.send({ embeds: [SuccessEmbed.build("Thank you for using our service!")] });
    } catch (err) {
      await message.channel.send({ embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
