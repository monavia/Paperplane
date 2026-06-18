const { Events } = require("discord.js");
const botConfig = require("../config/bot");
const AIEngine = require("../core/ai/AIEngine");
const AIDJ = require("../core/ai/AIDJ");
const MusicService = require("../services/MusicService");
const { getPlayer } = require("../core/music/PlayerManager");
const ErrorEmbed = require("../ui/embeds/ErrorEmbed");
const SuccessEmbed = require("../ui/embeds/SuccessEmbed");
const QueueEmbed = require("../ui/embeds/QueueEmbed");
const Logger = require("../core/utils/Logger");

const trigger = botConfig.trigger;
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
          return message.channel.send({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")] });
        }
        const { result } = await MusicService.play(message.guildId, voice.id, message.channelId, interpreted.query, message.author);
        if (result?.loadType === "playlist") {
          return message.channel.send({ embeds: [SuccessEmbed.build(`Menambahkan ${result.tracks.length} lagu ke antrian.`)] });
        }
      }

      if (interpreted.type === "playlist" && interpreted.songs?.length) {
        const voice = message.member.voice.channel;
        if (!voice) {
          return message.channel.send({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")] });
        }
        const engine = MusicService.getEngine(message.guildId);
        const player = await engine.join(voice.id, message.channelId);
        if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("Gagal join voice channel.")] });

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

        if (!found.length) return message.channel.send({ embeds: [ErrorEmbed.build("Tidak ada lagu yang ditemukan.")] });

        if (player.playing || player.paused) {
          engine.queue.addMultiple(found);
        } else {
          engine.queue.clear();
          engine.queue.addMultiple(found);
          const first = engine.queue.next();
          if (first) await player.play({ track: first, clientTrack: first });
        }

        MusicService.saveState(message.guildId).catch(() => {});
        return message.channel.send({ embeds: [SuccessEmbed.build(`Menambahkan ${found.length} lagu ke antrian.`)] });
      }

      if (interpreted.type === "skip") {
        const voice = message.member.voice.channel;
        if (!voice) return message.channel.send({ embeds: [ErrorEmbed.build("Kamu harus join voice channel dulu.")] });
        const player = MusicService.getEngine(message.guildId).player;
        if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")] });
        await MusicService.skip(message.guildId);
        return;
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
        return QueueEmbed.send(message.channel, tracks, message.author.id);
      }

      if (interpreted.type === "nowplaying") {
        const player = getPlayer(message.guildId);
        const track = player?.queue?.current;
        if (!track) return message.channel.send({ embeds: [ErrorEmbed.build("Tidak ada lagu yang sedang diputar.")] });
        return message.channel.send({ embeds: [NowPlayingEmbed.build(track, player)] });
      }

      if (interpreted.type === "help") {
        const { EmbedBuilder } = require("discord.js");
        const Colors = require("../core/constants/Colors");
        const prefix = botConfig.prefix;
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
                `\`${prefix}np\` — Lagu yang sedang diputar\n` +
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

      // Chat response
      const today = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const reply = await AIEngine.ask(message.author.id, input, `Today is ${today}. You are a helpful Discord assistant. Answer concisely.`);
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
