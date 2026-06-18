const MusicService = require("../../../services/MusicService");
const NowPlayingEmbed = require("../../../ui/embeds/NowPlayingEmbed");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");
const Logger = require("../../../core/utils/Logger");

module.exports = {
  name: "play",
  aliases: ["p"],
  async execute(message, args) {
    const query = args.join(" ");
    if (!query) return message.channel.send({ embeds: [ErrorEmbed.build("Please provide a song name or URL.")] });

    const voice = message.member.voice.channel;
    if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });

    const msg = await message.channel.send("Searching...");

    try {
      const { engine, result, track } = await MusicService.play(message.guildId, voice.id, message.channelId, query, message.author);

      if (result.loadType === "playlist") {
        await msg.edit({ content: null, embeds: [SuccessEmbed.build(`Added ${result.tracks.length} tracks to the queue.`)] });
      } else {
        await msg.edit({
          content: null,
          embeds: [NowPlayingEmbed.build(track, engine.player)],
        });
      }
    } catch (err) {
      Logger.error("!play error:", err.message);
      await msg.edit({ content: null, embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
