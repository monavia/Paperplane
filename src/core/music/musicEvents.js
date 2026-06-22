const lavalink = require("./lavalink");
const state = require("../state/StateManager");
const Logger = require("../utils/Logger");
const { EmbedBuilder } = require("discord.js");
const Colors = require("../constants/Colors");

const disconnectTimers = new Map();
const errorTimestamps = new Map(); // guildId -> [timestamp] (for cascade throttle)
const trackStartTimes = new Map(); // guildId -> { track, startedAt }

function register(client) {
  const l = lavalink.get();
  if (!l) return;

  l.on("trackStart", (player, track) => {
    state.nowPlaying.set(player.guildId, track);
    trackStartTimes.set(player.guildId, { track, startedAt: Date.now() });
    Logger.debug(`Track started in ${player.guildId}: ${track.info.title}`);

    // Cancel pending disconnect timer
    const timer = disconnectTimers.get(player.guildId);
    if (timer) {
      clearTimeout(timer);
      disconnectTimers.delete(player.guildId);
    }

    // Cache player state for failover
    lavalink.cachePlayer(player.guildId, {
      voiceChannelId: player.voiceChannelId,
      textChannelId: player.textChannelId,
      currentTrack: track,
      position: player.position || 0,
      volume: player.volume,
    });

    lavalink.startPositionTracking(player.guildId);

    // Send Now Playing embed
    if (player.textChannelId) {
      const channel = client.channels.cache.get(player.textChannelId);
      if (channel) {
        const embed = new EmbedBuilder()
          .setDescription(`Now Playing [${track.info.title || "Unknown"}](${track.info.uri || ""})`)
          .setColor(Colors.NOWPLAYING);
        channel.send({ embeds: [embed] }).catch(() => {});
      }
    }
  });

  l.on("trackEnd", (player, track, reason) => {
    Logger.info(`[trackEnd] guild=${player.guildId} reason=${typeof reason === 'object' ? reason?.reason : reason} title=${track?.info?.title?.substring(0,30) || "null"}`);

    // Record track play for stats
    const startInfo = trackStartTimes.get(player.guildId);
    if (startInfo) {
      const playedMs = Date.now() - startInfo.startedAt;
      const { recordTrackPlay } = require("../../services/StatsService");
      recordTrackPlay(player.guildId, startInfo.track, Math.min(playedMs, track?.info?.duration || playedMs));
      trackStartTimes.delete(player.guildId);
    }

    // Don't delete nowPlaying here — queueEnd will handle it;
    // keeps nowPlaying available during the trackEnd→queueEnd gap (prevents race with -np)
    lavalink.stopPositionTracking(player.guildId);
    lavalink.cachePlayer(player.guildId, {
      voiceChannelId: player.voiceChannelId,
      textChannelId: player.textChannelId,
      currentTrack: null,
      position: player.position || 0,
      volume: player.volume,
    });
  });

  l.on("queueEnd", async (player, track, payload) => {
    // Loop to skip unresolvable tracks (prevents cascade spam)
    // NOTE: state.nowPlaying is NOT deleted here — trackEnd keeps the old track
    // visible during the gap. It's only deleted when queue is truly empty below.
    const qSize = state.queues.get(player.guildId).length;
    Logger.info(`[queueEnd] guild=${player.guildId} queueSize=${qSize} lastTrack=${track?.info?.title?.substring(0,30) || "null"}`);
    let next = null;
    while (true) {
      const queue = state.queues.get(player.guildId);
      if (!queue.length) break;
      next = queue.shift();
      state.queues.set(player.guildId, queue);

      // Re-search if encoded is missing (e.g. stale from DB restore)
      if (!next.encoded && next.info?.uri) {
        try {
          const res = await player.search({ query: next.info.uri }, client.user);
          if (res?.tracks?.length) {
            Object.assign(next, res.tracks[0]);
          }
        } catch {}
      }

      if (!next.encoded) {
        next = null;
        continue;
      }

      break;
    }

    if (next) {
      state.nowPlaying.set(player.guildId, next);
      try {
        await player.play({ track: next, clientTrack: next });
      } catch (err) {
        Logger.error(`Failed to play next: ${next.info?.title} — ${err.message}`);
        const { sendError } = require("../../core/utils/ErrorReporter");
        await sendError("Track play failed", `Guild: \`${player.guildId}\`\nTrack: **${next.info?.title || "Unknown"}**\nError: \`${err.message}\``);
        l.emit("queueEnd", player, next, { reason: "playFailed" });
      }
      return;
    }

    // Queue is empty — try autoplay before disconnecting
    try {
      const { getEngine } = require("../../services/MusicService");
      const engine = getEngine(player.guildId);
      if (engine?.playback?.autoplay) {
        const AutoplayEngine = require("./AutoplayEngine");
        const autoplay = new AutoplayEngine();
        const autoTrack = await autoplay.getNextTrack(player, track);
        if (autoTrack) {
          state.nowPlaying.set(player.guildId, autoTrack);
          await player.play({ track: autoTrack, clientTrack: autoTrack }).catch(err => {
            Logger.error(`Autoplay playback failed: ${err.message}`);
          });
          return;
        }
      }
    } catch (err) {
      Logger.error(`Autoplay error for ${player.guildId}:`, err.message);
    }

    state.nowPlaying.delete(player.guildId);

    const timerId = setTimeout(() => {
      player.disconnect();
      player.destroy();
      lavalink.uncachePlayer(player.guildId);
      state.queues.clear(player.guildId);
      disconnectTimers.delete(player.guildId);
    }, 180000);

    disconnectTimers.set(player.guildId, timerId);
  });

  l.on("trackError", (player, track, error) => {
    Logger.error(`Track error in ${player.guildId}: ${error.message}`);
    const { sendError } = require("../../core/utils/ErrorReporter");
    sendError("Track error", `Guild: \`${player.guildId}\`\nTrack: **${track?.info?.title || "Unknown"}**\nError: \`${error.message}\``);

    // Throttle: skip if 5+ errors within 15 seconds (prevents infinite cascade)
    const now = Date.now();
    const guildErrors = errorTimestamps.get(player.guildId) || [];
    const recent = guildErrors.filter(t => now - t < 15000);
    recent.push(now);
    errorTimestamps.set(player.guildId, recent);
    if (recent.length >= 5) {
      Logger.error(`[trackError] cascade throttle triggered for ${player.guildId}, stopping playback`);
      const { sendError: send2 } = require("../../core/utils/ErrorReporter");
      send2("Track error cascade throttle", `Guild: \`${player.guildId}\` — 5+ errors in 15s, playback stopped`);
      errorTimestamps.delete(player.guildId);
      player.stopPlaying().catch(() => {});
      return;
    }

    // Auto-skip to next track
    if (player.node?.connected) {
      player.stopPlaying().catch(() => {});
    }
  });

  l.on("trackStuck", (player, track, threshold) => {
    Logger.warn(`[trackStuck] guild=${player.guildId} threshold=${threshold}ms title=${track?.info?.title?.substring(0,30) || "null"}`);
    const { sendError } = require("../../core/utils/ErrorReporter");
    sendError("Track stuck", `Guild: \`${player.guildId}\`\nTrack: **${track?.info?.title || "Unknown"}**\nThreshold: \`${threshold}ms\``);
    if (player.node?.connected) {
      player.stopPlaying().catch(() => {});
    }
  });

  l.on("playerDisconnect", (player) => {
    Logger.warn(`Player disconnected in ${player.guildId}`);
    const { sendInfo } = require("../../core/utils/ErrorReporter");
    sendInfo("Player disconnected", `Guild: \`${player.guildId}\`\nVoice: \`${player.voiceChannelId || "unknown"}\``);
    state.nowPlaying.delete(player.guildId);
    state.queues.clear(player.guildId);
    lavalink.stopPositionTracking(player.guildId);
    lavalink.uncachePlayer(player.guildId);
    trackStartTimes.delete(player.guildId);
    const timer = disconnectTimers.get(player.guildId);
    if (timer) {
      clearTimeout(timer);
      disconnectTimers.delete(player.guildId);
    }
  });
}

module.exports = { register };

//======================
// Created by monavia
// Don't change if you don't know
//======================
