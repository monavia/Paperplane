const { Events, PermissionFlagsBits } = require("discord.js");
const botConfig = require("../config/bot");
const GuildRepository = require("../database/repositories/GuildRepository");
const AIEngine = require("../core/ai/AIEngine");
const AIDJ = require("../core/ai/AIDJ");
const MusicService = require("../services/MusicService");
const { getPlayer } = require("../core/music/PlayerManager");
const ErrorEmbed = require("../ui/embeds/ErrorEmbed");
const SuccessEmbed = require("../ui/embeds/SuccessEmbed");
const QueueEmbed = require("../ui/embeds/QueueEmbed");
const NowPlayingEmbed = require("../ui/embeds/NowPlayingEmbed");
const LoadingEmbed = require("../ui/embeds/LoadingEmbed");
const Logger = require("../core/utils/Logger");

const trigger = botConfig.trigger;
const aidj = new AIDJ();

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const content = message.content.trim();
    const guild = await GuildRepository.findByGuildId(message.guildId);
    const prefix = guild.prefix || botConfig.prefix;

    // Prefix commands
    if (content.startsWith(prefix)) {
      const args = content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;

      const command = message.client.prefixCommands?.get(commandName);
      if (!command) return;

      try {
        await command.execute(message, args);
        const { recordCommandUsage } = require("../services/StatsService");
        recordCommandUsage(message.guildId, commandName, message.author.id);
      } catch (err) {
        Logger.error(`Prefix error (${commandName}):`, err.message);
        await message.reply({ embeds: [ErrorEmbed.build("An error occurred while executing that command.")] }).catch(() => {});
      }
      return;
    }

    // Natural language commands (trigger word or bot mention)
    const botMentioned = message.mentions.has(message.client.user);
    const triggerAtStart = content.toLowerCase().indexOf(trigger) === 0;

    if (!triggerAtStart && !botMentioned) return;

    let input;
    if (triggerAtStart) {
      input = content.slice(trigger.length).replace(/^[,:\s]+/, "").trim();
    } else {
      input = content.replace(/<@!?\d+>/g, "").trim();
      if (!input) return;
    }

    try {
      const interpreted = await aidj.interpret(input);

      if (interpreted.type === "play" && interpreted.query) {
        const voice = message.member.voice.channel;
        if (!voice) {
          return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });
        }
        const msg = await message.channel.send({ embeds: [LoadingEmbed.build("Searching...")] });
        try {
          const { result, track, wasPlaying } = await MusicService.play(message.guildId, voice.id, message.channelId, interpreted.query, message.author);
          await msg.delete().catch(() => {});
          if (result?.loadType === "playlist") {
            return message.channel.send({ embeds: [SuccessEmbed.build(`Added ${result.tracks.length} tracks to the queue.`)] });
          }
          if (result?.spotifyTotal) {
            message.channel.send({ embeds: [SuccessEmbed.build(`Added ${result.spotifyTotal} tracks to the queue...`)] }).catch(() => {});
          }
          if (wasPlaying || result?.tracks?.length > 1) {
            const title = track?.info?.title || track?.title || track?.name || "lagu";
            const url = track?.info?.uri;
            const label = url ? `[${title}](${url})` : title;
            return message.channel.send({ embeds: [SuccessEmbed.build(`Added ${label}`)] });
          }
          return;
        } catch (err) {
          await msg.delete().catch(() => {});
          Logger.error("AI play error:", err.message);
          return message.channel.send({ embeds: [ErrorEmbed.build(err.message)] }).catch(() => {});
        }
      }

      if (interpreted.type === "playlist" && interpreted.songs?.length) {
        const voice = message.member.voice.channel;
        if (!voice) {
          return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });
        }
        const engine = MusicService.getEngine(message.guildId);
        const player = await engine.join(voice.id, message.channelId);
        if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("Failed to join voice channel.")] });

        const maxSongs = 50;
        const toSearch = interpreted.songs.slice(0, maxSongs);
        const found = [];

        const chunkSize = 5;
        for (let i = 0; i < toSearch.length; i += chunkSize) {
          const chunk = toSearch.slice(i, i + chunkSize);
          const results = await Promise.allSettled(
            chunk.map((song) => player.search({ query: `ytsearch:${song}` }, message.author))
          );
          for (const r of results) {
            if (r.status === "fulfilled" && r.value?.tracks?.length) found.push(r.value.tracks[0]);
          }
        }

        if (!found.length) return message.channel.send({ embeds: [ErrorEmbed.build("No tracks found.")] });

        if (player.playing || player.paused) {
          engine.queue.addMultiple(found);
        } else {
          engine.queue.clear();
          engine.queue.addMultiple(found);
          const first = engine.queue.next();
          if (first) await player.play({ track: first, clientTrack: first });
        }

        MusicService.saveState(message.guildId).catch(() => {});
        return message.channel.send({ embeds: [SuccessEmbed.build(`Added ${found.length} tracks to the queue.`)] });
      }

      if (interpreted.type === "skip") {
        Logger.info(`[SKIP-AI] seryn skip triggered by "${message.author.tag}"`);
        const voice = message.member.voice.channel;
        if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });
        const player = MusicService.getEngine(message.guildId).player;
        if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("No track is currently playing.")] });
        await MusicService.skip(message.guildId);
        return;
      }

      if (interpreted.type === "stop") {
        const voice = message.member.voice.channel;
        if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });
        const player = MusicService.getEngine(message.guildId).player;
        if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("No track is currently playing.")] });
        const hadTracks = !!(player.playing || player.paused || MusicService.getQueue(message.guildId)?.length);
        await MusicService.stop(message.guildId);
        if (!hadTracks) {
          return message.channel.send({ embeds: [SuccessEmbed.build("Queue empty.")] });
        }
        return message.channel.send({ embeds: [SuccessEmbed.build("Thank you for using our service!")] }).catch(() => {});
      }

      if (interpreted.type === "pause") {
        const voice = message.member.voice.channel;
        if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });
        const player = MusicService.getEngine(message.guildId).player;
        if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("No track is currently playing.")] });
        const paused = await MusicService.pause(message.guildId);
        if (!paused) return message.channel.send({ embeds: [ErrorEmbed.build("Failed to pause playback.")] });
        return message.channel.send({ embeds: [SuccessEmbed.build("Playback paused.")] });
      }

      if (interpreted.type === "resume") {
        const voice = message.member.voice.channel;
        if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("You must be in a voice channel.")] });
        const player = MusicService.getEngine(message.guildId).player;
        if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("No track is currently playing.")] });
        const resumed = await MusicService.resume(message.guildId);
        if (!resumed) return message.channel.send({ embeds: [ErrorEmbed.build("Failed to resume playback.")] });
        return message.channel.send({ embeds: [SuccessEmbed.build("Playback resumed.")] });
      }

      if (interpreted.type === "autoplay") {
        const engine = MusicService.getEngine(message.guildId);
        if (!engine) return message.channel.send({ embeds: [ErrorEmbed.build("No active player.")] });
        engine.playback.autoplay = !engine.playback.autoplay;
        const status = engine.playback.autoplay ? "diaktifkan" : "dinonaktifkan";
        return message.channel.send({ embeds: [SuccessEmbed.build(`Autoplay ${status}.`)] });
      }

      if (interpreted.type === "shuffle") {
        const tracks = MusicService.getQueue(message.guildId);
        if (!tracks?.length) return message.channel.send({ embeds: [ErrorEmbed.build("Queue is empty.")] });
        await MusicService.shuffle(message.guildId);
        return message.channel.send({ embeds: [SuccessEmbed.build("Queue shuffled.")] });
      }

      if (interpreted.type === "loop") {
        const player = getPlayer(message.guildId);
        if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("No active player.")] });
        const args = input.split(/\s+/).slice(1);
        const mode = args[0]?.toLowerCase();
        if (!mode || !["none", "track", "queue"].includes(mode)) {
          return message.channel.send({ embeds: [ErrorEmbed.build("Gunakan: loop <none|track|queue>")] });
        }
        player.setLoop(mode);
        return message.channel.send({ embeds: [SuccessEmbed.build(`Mode loop: \`${mode}\`.`)] });
      }

      if (interpreted.type === "seek") {
        const player = getPlayer(message.guildId);
        if (!player || !player.queue.current) return message.channel.send({ embeds: [ErrorEmbed.build("No track is playing.")] });
        const { parseTimestamp, parseDuration } = require("../core/utils/Duration");
        const args = input.split(/\s+/).slice(1);
        const posStr = args.join(" ");
        if (!posStr) return message.channel.send({ embeds: [ErrorEmbed.build("Gunakan: seek <mm:ss atau ss>")] });
        const ms = parseTimestamp(posStr);
        if (isNaN(ms)) return message.channel.send({ embeds: [ErrorEmbed.build("Format waktu salah. Gunakan mm:ss atau ss.")] });
        if (ms > player.queue.current.info.duration) return message.channel.send({ embeds: [ErrorEmbed.build("Melebihi durasi lagu.")] });
        player.seek(ms);
        return message.channel.send({ embeds: [SuccessEmbed.build(`Loncat ke ${parseDuration(ms)}.`)] });
      }

      if (interpreted.type === "volume") {
        const args = input.split(/\s+/).slice(1);
        const level = parseInt(args[0]);
        if (isNaN(level) || level < 1 || level > 100) return message.channel.send({ embeds: [ErrorEmbed.build("Volume harus 1-100.")] });
        MusicService.setVolume(message.guildId, level);
        return message.channel.send({ embeds: [SuccessEmbed.build(`Volume diatur ke ${level}%`)] });
      }

      if (interpreted.type === "ping") {
        const PingEmbed = require("../ui/embeds/PingEmbed");
        const sent = await message.channel.send({ embeds: [LoadingEmbed.build("Pinging...")] });
        const botLatency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = message.client.ws.ping;
        await sent.edit({ content: null, embeds: [PingEmbed.build(botLatency, apiLatency)] });
        return;
      }

      if (interpreted.type === "stats") {
        const StatsEmbed = require("../ui/embeds/StatsEmbed");
        return message.channel.send({ embeds: [StatsEmbed.build(message.client)] });
      }

      if (interpreted.type === "queue") {
        const tracks = MusicService.getQueue(message.guildId);
        if (!tracks?.length) return message.channel.send({ embeds: [ErrorEmbed.build("Queue is empty.")] });
        return QueueEmbed.send(message.channel, tracks, message.author.id);
      }

      if (interpreted.type === "prefix") {
        const GuildRepository = require("../database/repositories/GuildRepository");
        const guild = await GuildRepository.findByGuildId(message.guildId);
        const current = guild.prefix || botConfig.prefix;
        const isSet = /^set\s+/i.test(input);
        if (isSet) {
          if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.channel.send({ embeds: [ErrorEmbed.build("Kamu tidak dapat menggunakan command ini, hanya dengan role Administrator/Owner server yang bisa memakai command ini.")] });
          }
          const setMatch = input.match(/^set\s+prefix\s+(\S+)/i);
          if (!setMatch) {
            return message.channel.send({ embeds: [ErrorEmbed.build("Gunakan: set prefix <prefix baru>")] });
          }
          const newPrefix = setMatch[1];
          await GuildRepository.updatePrefix(message.guildId, newPrefix);
          return message.channel.send({ embeds: [SuccessEmbed.build(`Prefix diganti menjadi \`${newPrefix}\``)] });
        }
        return message.channel.send({ embeds: [SuccessEmbed.build(`Prefix server ini: \`${current}\``)] });
      }

      if (interpreted.type === "nowplaying") {
        const player = getPlayer(message.guildId);
        const track = player?.queue?.current;
        if (!track) return message.channel.send({ embeds: [ErrorEmbed.build("No track is currently playing.")] });
        return message.channel.send({ embeds: [NowPlayingEmbed.build(track, player)] });
      }

      if (interpreted.type === "help") {
        const { EmbedBuilder } = require("discord.js");
        const Colors = require("../core/constants/Colors");
        const embed = new EmbedBuilder()
          .setTitle("Help")
          .setDescription("Daftar perintah yang tersedia:")
          .addFields(
            {
              name: "🎵 Music",
              value:
                `\`${prefix}play <judul/url>\` — Memutar lagu\n` +
                `\`${prefix}skip\` — Melewati lagu\n` +
                `\`${prefix}stop\` — Berhenti & disconnect\n` +
                `\`${prefix}pause\` — Jeda lagu\n` +
                `\`${prefix}resume\` — Lanjutkan lagu\n` +
                `\`${prefix}queue\` — Lihat antrian\n` +
                `\`${prefix}np\` — Now playing\n` +
                `\`${prefix}volume <1-100>\` — Atur volume\n` +
                `\`${prefix}shuffle\` — Acak antrian\n` +
                `\`${prefix}loop\` — Ulang lagu/antrian\n` +
                `\`${prefix}seek <detik>\` — Loncat ke posisi\n` +
                `\`${prefix}autoplay\` — Putar lagu serupa`,
            },
            {
              name: "🤖 AI",
              value:
                `\`${prefix}recommend\` — Rekomendasi lagu`,
            },
            {
              name: "⚙️ System",
              value:
                "`" + `${prefix}` + "ping` — Cek respon bot\n" +
                "`" + `${prefix}` + "help` — Bantuan ini\n" +
                "`" + `${prefix}` + "info` — Info bot\n" +
                "`" + `${prefix}` + "stats` — Statistik bot\n" +
                "`" + `${prefix}` + "prefix` — Ganti prefix",
            },
            {
              name: "💬 AI Chat (Natural Language)",
              value:
                "Ketik `" + `${trigger}` + " <pesan>` untuk ngobrol dengan AI.\n" +
                `Contoh: \`${trigger} apa kabar?\`\n\n` +
                "Kamu juga bisa kontrol musik pakai bahasa alami:\n" +
                `\`${trigger} mainkan lagu nina\`\n` +
                `\`${trigger} buatkan playlist untuk game santai\`\n` +
                `\`${trigger} skip\`\n` +
                `\`${trigger} stop\``,
            },
          )
          .setColor(Colors.PRIMARY);
        return message.channel.send({ embeds: [embed] });
      }

      if (interpreted.type === "info") {
        const { EmbedBuilder } = require("discord.js");
        const Colors = require("../core/constants/Colors");
        const embed = new EmbedBuilder()
          .setTitle(message.client.user.username)
          .setDescription("A full-featured Discord bot with music playback (Lavalink), AI assistant, and more.")
          .addFields(
            { name: "Version", value: "2.0.0", inline: true },
            { name: "Library", value: "discord.js v14", inline: true },
            { name: "Music Engine", value: "Lavalink", inline: true },
            { name: "AI Engine", value: "Ollama (Local)", inline: true },
            { name: "Servers", value: String(message.client.guilds.cache.size), inline: true },
          )
          .setThumbnail(message.client.user.displayAvatarURL())
          .setColor(Colors.INFO);
        return message.channel.send({ embeds: [embed] });
      }

      // Chat response
      const today = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const reply = await AIEngine.ask(message.author.id, input, `Today is ${today}. You are a helpful Discord assistant. Answer concisely.`);
      if (reply) message.channel.send(reply);
    } catch (err) {
      Logger.error("AI command error:", err.message);
      const isOffline = /fetch\s+failed|ECONNREFUSED|Ollama error/i.test(err.message);
      message.channel.send({ embeds: [ErrorEmbed.build(isOffline ? "Sorry, AI is offline." : "Sorry, an error occurred.")] }).catch(() => {});
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
