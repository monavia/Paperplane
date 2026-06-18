const MusicService = require("../../../services/MusicService");
const QueueEmbed = require("../../../ui/embeds/QueueEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "queue",
  aliases: ["q"],
  async execute(message, args) {
    const tracks = MusicService.getQueue(message.guildId);
    if (!tracks?.length) return message.channel.send({ embeds: [ErrorEmbed.build("Queue is empty.")] });

    await QueueEmbed.send(message.channel, tracks, message.author.id);
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
