const MusicService = require("../../../services/MusicService");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");
const Logger = require("../../../core/utils/Logger");

module.exports = {
  name: "skip",
  async execute(message, args) {
    const voice = message.member.voice.channel;
    if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });

    const player = MusicService.getEngine(message.guildId).player;
    if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("No track is currently playing.")] });

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
