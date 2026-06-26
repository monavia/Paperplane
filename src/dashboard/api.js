const { Router } = require("express");
const MusicService = require("../services/MusicService");
const { getPlayer } = require("../core/music/PlayerManager");
const GuildRepository = require("../database/repositories/GuildRepository");
const Logger = require("../core/utils/Logger");

function api(client) {
  const router = Router();

  function requireAuth(req, res, next) {
    if (!req.session.accessToken) return res.status(401).json({ error: "Not authenticated" });
    next();
  }

  router.use(requireAuth);

  router.get("/:guildId", async (req, res) => {
    try {
      const { guildId } = req.params;
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: "Guild not found" });

      const player = getPlayer(guildId);
      const queue = MusicService.getQueue(guildId) || [];

      const guildDoc = await GuildRepository.findByGuildId(guildId);
      const prefix = guildDoc?.prefix || "-";

      const offset = Math.max(0, Number(req.query.offset) || 0);
      const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));

      const state = {
        guild: { id: guild.id, name: guild.name, prefix },
        player: null,
        queue: [],
        queueTotal: queue.length,
        queueOffset: offset,
        queueLimit: limit,
      };

      if (player) {
        const nowPlaying = player.queue.current;
        state.player = {
          playing: player.playing,
          paused: player.paused,
          volume: player.volume,
          position: player.position || 0,
          nowPlaying: nowPlaying
            ? {
                title: nowPlaying.info?.title || "Unknown",
                author: nowPlaying.info?.author || "",
                duration: nowPlaying.info?.duration || 0,
                uri: nowPlaying.info?.uri || "",
                thumbnail: nowPlaying.info?.artworkUrl || null,
              }
            : null,
        };
      }

      state.queue = queue.slice(offset, offset + limit).map((t) => ({
        title: t.info?.title || "Unknown",
        author: t.info?.author || "",
        duration: t.info?.duration || 0,
        uri: t.info?.uri || "",
      }));

      res.json(state);
    } catch (err) {
      Logger.error("Dashboard player GET error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/:guildId/play", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: "Query is required" });

      const guild = client.guilds.cache.get(req.params.guildId);
      if (!guild) return res.status(404).json({ error: "Guild not found" });

      const me = guild.members.me;
      const voiceChannelId = me?.voice?.channelId;

      if (!voiceChannelId) {
        return res.status(400).json({ error: "Bot is not in a voice channel" });
      }

      const textChan = guild.systemChannelId
        ? guild.channels.cache.get(guild.systemChannelId)
        : guild.channels.cache.find(c => c.isTextBased());
      const textChannelId = textChan?.id || guild.channels.cache.first()?.id;

      await MusicService.play(req.params.guildId, voiceChannelId, textChannelId, query, client.user);
      res.json({ ok: true });
    } catch (err) {
      Logger.error("Dashboard play error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/:guildId/skip", async (req, res) => {
    try {
      await MusicService.skip(req.params.guildId);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/:guildId/stop", async (req, res) => {
    try {
      await MusicService.stop(req.params.guildId);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/:guildId/pause", async (req, res) => {
    try {
      await MusicService.pause(req.params.guildId);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/:guildId/resume", async (req, res) => {
    try {
      await MusicService.resume(req.params.guildId);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/:guildId/stats", async (req, res) => {
    try {
      const { getStats } = require("../services/StatsService");
      const days = Number(req.query.days) || 7;
      const stats = await getStats(req.params.guildId, days);
      res.json(stats);
    } catch (err) {
      Logger.error("Dashboard stats error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/:guildId/prefix", async (req, res) => {
    try {
      const guildDoc = await GuildRepository.findByGuildId(req.params.guildId);
      res.json({ prefix: guildDoc?.prefix || "-" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/:guildId/prefix", async (req, res) => {
    try {
      const { prefix } = req.body;
      if (!prefix || prefix.length > 3) {
        return res.status(400).json({ error: "Prefix must be 1-3 characters" });
      }
      await GuildRepository.updatePrefix(req.params.guildId, prefix);
      res.json({ ok: true, prefix });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/:guildId/volume", async (req, res) => {
    try {
      const { volume } = req.body;
      const level = Number(volume);
      if (isNaN(level) || level < 1 || level > 100) {
        return res.status(400).json({ error: "Volume must be 1-100" });
      }
      MusicService.setVolume(req.params.guildId, level);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = api;

//======================
// Created by monavia
// Don't change if you don't know
//======================
