const { Events } = require("discord.js");
const botConfig = require("../config/bot");
const AIEngine = require("../core/ai/AIEngine");
const AIDJ = require("../core/ai/AIDJ");
const MusicService = require("../services/MusicService");
const ErrorEmbed = require("../ui/embeds/ErrorEmbed");
const SuccessEmbed = require("../ui/embeds/SuccessEmbed");
const NowPlayingEmbed = require("../ui/embeds/NowPlayingEmbed");
const QueueEmbed = require("../ui/embeds/QueueEmbed");
const Logger = require("../core/utils/Logger");

const trigger = "seryn";
const aidj = new AIDJ();

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const content = message.content.trim();
    const prefix = botConfig.prefix;

    // Prefix commands
    if (content.startsWith(prefix)) {
      const args = content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;

      const command = message.client.prefixCommands?.get(commandName);
      if (!command) return;

      try {
        await command.execute(message, args);
      } catch (err) {
        Logger.error(`Prefix error (${commandName}):`, err.message);
        await message.reply({ embeds: [ErrorEmbed.build("An error occurred while executing that command.")] }).catch(() => {});
      }
      return;
    }

    // Natural language commands (trigger word)
    const triggerIndex = content.toLowerCase().indexOf(trigger);
    if (triggerIndex !== 0) return;

    const input = content.slice(trigger.length).replace(/^[,:\s]+/, "").trim();
    if (!input) return;

    try {
      const interpreted = await aidj.interpret(input);

      if (interpreted.type === "play" && interpreted.query) {
        const voice = message.member.voice.channel;
        if (!voice) {
          return message.channel.send({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")] });
        }
        const { track } = await MusicService.play(message.guildId, voice.id, message.channelId, interpreted.query, message.author);
        return message.channel.send({ embeds: [NowPlayingEmbed.build(track)] });
      }

      if (interpreted.type === "skip") {
        const voice = message.member.voice.channel;
        if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")] });
        const player = MusicService.getEngine(message.guildId).player;
        if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")] });
        await MusicService.skip(message.guildId);
        return message.channel.send({ embeds: [SuccessEmbed.build("Lagu dilewati.")] });
      }

      if (interpreted.type === "stop") {
        const voice = message.member.voice.channel;
        if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")] });
        const player = MusicService.getEngine(message.guildId).player;
        if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")] });
        await MusicService.stop(message.guildId);
        return message.channel.send({ embeds: [SuccessEmbed.build("Playback dihentikan.")] });
      }

      if (interpreted.type === "pause") {
        const voice = message.member.voice.channel;
        if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")] });
        const player = MusicService.getEngine(message.guildId).player;
        if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")] });
        const paused = await MusicService.pause(message.guildId);
        if (!paused) return message.channel.send({ embeds: [ErrorEmbed.build("Gagal menjeda playback.")] });
        return message.channel.send({ embeds: [SuccessEmbed.build("Playback dijeda.")] });
      }

      if (interpreted.type === "resume") {
        const voice = message.member.voice.channel;
        if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")] });
        const player = MusicService.getEngine(message.guildId).player;
        if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")] });
        const resumed = await MusicService.resume(message.guildId);
        if (!resumed) return message.channel.send({ embeds: [ErrorEmbed.build("Gagal melanjutkan playback.")] });
        return message.channel.send({ embeds: [SuccessEmbed.build("Playback dilanjutkan.")] });
      }

      if (interpreted.type === "queue") {
        const tracks = MusicService.getQueue(message.guildId);
        if (!tracks?.length) return message.channel.send({ embeds: [ErrorEmbed.build("Antrian kosong.")] });
        return message.channel.send({ embeds: [QueueEmbed.build(tracks)] });
      }

      // Chat response
      const reply = await AIEngine.ask(message.author.id, input, "You are a helpful Discord assistant. Answer concisely.");
      if (reply) message.channel.send(reply);
    } catch (err) {
      Logger.error("AI command error:", err.message);
      message.channel.send({ embeds: [ErrorEmbed.build("Maaf, terjadi kesalahan.")] }).catch(() => {});
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
