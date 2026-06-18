const MusicService = require("../../../services/MusicService");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "resume",
  async execute(message, args) {
    const voice = message.member.voice.channel;
    if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")] });

    const player = MusicService.getEngine(message.guildId).player;
    if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")] });

    const resumed = await MusicService.resume(message.guildId);
    if (!resumed) return message.channel.send({ embeds: [ErrorEmbed.build("Gagal melanjutkan playback.")] });

    await message.channel.send({ embeds: [SuccessEmbed.build("Playback dilanjutkan.")] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
