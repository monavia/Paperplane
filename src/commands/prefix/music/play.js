const MusicService = require("../../../services/MusicService");
const NowPlayingEmbed = require("../../../ui/embeds/NowPlayingEmbed");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");
const LoadingEmbed = require("../../../ui/embeds/LoadingEmbed");
const Logger = require("../../../core/utils/Logger");

module.exports = {
  name: "play",
  aliases: ["p"],
  async execute(message, args) {
    const query = args.join(" ");
    if (!query) return message.channel.send({ embeds: [ErrorEmbed.build("Please provide a song name or URL.")] });

    const voice = message.member.voice.channel;
    if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });

    const msg = await message.channel.send({ embeds: [LoadingEmbed.build("Searching...")] });

    try {
      const { engine, result, track, wasPlaying } = await MusicService.play(message.guildId, voice.id, message.channelId, query, message.author);

      await msg.delete().catch(() => {});

      if (result.loadType === "playlist") {
        return message.channel.send({ embeds: [SuccessEmbed.build(`Added ${result.tracks.length} tracks to the queue.`)] });
      }
      if (result?.spotifyTotal) {
        message.channel.send({ embeds: [SuccessEmbed.build(`Added ${result.spotifyTotal} tracks to the queue...`)] }).catch(() => {});
        return;
      }
      if (wasPlaying) {
        const title = track?.info?.title || track?.title || track?.name || "lagu";
        const url = track?.info?.uri;
        const label = url ? `[${title}](${url})` : title;
        return message.channel.send({ embeds: [SuccessEmbed.build(`Added ${label}`)] });
      }
      return message.channel.send({ embeds: [NowPlayingEmbed.build(track, engine.player)] });
    } catch (err) {
      Logger.error("!play error:", err.message);
      await msg.delete().catch(() => {});
      return message.channel.send({ embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
