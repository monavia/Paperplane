const MusicService = require("../../../services/MusicService");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "shuffle",
  async execute(message, args) {
    const voice = message.member.voice.channel;
    if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });

    const tracks = MusicService.getQueue(message.guildId);
    if (!tracks?.length) return message.channel.send({ embeds: [ErrorEmbed.build("Queue is empty.")] });

    await MusicService.shuffle(message.guildId);
    await message.channel.send({ embeds: [SuccessEmbed.build(`Queue shuffled (${tracks.length} tracks).`)] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
