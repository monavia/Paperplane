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

    const wasPlaying = player.playing || player.paused;

    try {
      await MusicService.stop(message.guildId);

      // If nothing was playing, queueEnd won't fire — send message directly
      if (!wasPlaying) {
        await message.channel.send({ embeds: [SuccessEmbed.build("Stopped.")] });
      }
    } catch (err) {
      await message.channel.send({ embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
