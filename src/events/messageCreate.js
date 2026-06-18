const { Events } = require("discord.js");
const botConfig = require("../config/bot");
const AIEngine = require("../core/ai/AIEngine");
const AIDJ = require("../core/ai/AIDJ");
const MusicService = require("../services/MusicService");
const ErrorEmbed = require("../ui/embeds/ErrorEmbed");
const NowPlayingEmbed = require("../ui/embeds/NowPlayingEmbed");
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
        await message.reply("An error occurred while executing that command.").catch(() => {});
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
          return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });
        }
        const { track } = await MusicService.play(message.guildId, voice.id, message.channelId, interpreted.query, message.author);
        return message.channel.send({ embeds: [NowPlayingEmbed.build(track)] });
      }

      if (interpreted.type === "skip") {
        await MusicService.skip(message.guildId);
        return message.channel.send("Skipped.");
      }

      if (interpreted.type === "stop") {
        await MusicService.stop(message.guildId);
        return message.channel.send("Stopped.");
      }

      if (interpreted.type === "pause") {
        await MusicService.pause(message.guildId);
        return message.channel.send("Paused.");
      }

      if (interpreted.type === "resume") {
        await MusicService.resume(message.guildId);
        return message.channel.send("Resumed.");
      }

      if (interpreted.type === "queue") {
        const tracks = MusicService.getQueue(message.guildId);
        return message.channel.send(`Queue has ${tracks.length} track(s).`);
      }

      // Chat response
      const reply = await AIEngine.ask(message.author.id, input, "You are a helpful Discord assistant. Answer concisely.");
      if (reply) message.channel.send(reply);
    } catch (err) {
      Logger.error("AI command error:", err.message);
      message.channel.send("Sorry, I couldn't process that.").catch(() => {});
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
