const MusicService = require("../../../services/MusicService");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");
const Logger = require("../../../core/utils/Logger");

module.exports = {
  name: "skip",
  async execute(message, args) {
    const voice = message.member.voice.channel;
    if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")] });

    const player = MusicService.getEngine(message.guildId).player;
    if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")] });

    try {
      await MusicService.skip(message.guildId);
    } catch (err) {
      await message.channel.send({ embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
