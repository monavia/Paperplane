const MusicService = require("../../../services/MusicService");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "pause",
  async execute(message, args) {
    const voice = message.member.voice.channel;
    if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")] });

    const player = MusicService.getEngine(message.guildId).player;
    if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")] });

    const paused = await MusicService.pause(message.guildId);
    if (!paused) return message.channel.send({ embeds: [ErrorEmbed.build("Gagal menjeda playback.")] });

    await message.channel.send({ embeds: [SuccessEmbed.build("Playback dijeda.")] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
