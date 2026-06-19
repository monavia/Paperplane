const lavalink = require("./lavalink");
const state = require("../state/StateManager");
const Logger = require("../utils/Logger");
const { EmbedBuilder } = require("discord.js");
const Colors = require("../constants/Colors");

const disconnectTimers = new Map();
const errorTimestamps = new Map(); // guildId -> [timestamp] (for cascade throttle)

function register(client) {
  const l = lavalink.get();
  if (!l) return;

  l.on("trackStart", (player, track) => {
    state.nowPlaying.set(player.guildId, track);
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
      player.play({ track: next, clientTrack: next }).catch(err => {
        Logger.error(`Failed to play next: ${next.info?.title} — ${err.message}`);
      });
      return;
    }

    // Queue is empty — start 3-minute disconnect timer
    state.nowPlaying.delete(player.guildId);
    if (player.textChannelId) {
      const channel = client.channels.cache.get(player.textChannelId);
      if (channel) {
        const embed = new EmbedBuilder()
          .setDescription("Antrian lagu telah kosong.")
          .setColor(Colors.WARNING);
        channel.send({ embeds: [embed] }).catch(() => {});
      }
    }

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

    // Throttle: skip if 5+ errors within 15 seconds (prevents infinite cascade)
    const now = Date.now();
    const guildErrors = errorTimestamps.get(player.guildId) || [];
    const recent = guildErrors.filter(t => now - t < 15000);
    recent.push(now);
    errorTimestamps.set(player.guildId, recent);
    if (recent.length >= 5) {
      Logger.error(`[trackError] cascade throttle triggered for ${player.guildId}, stopping playback`);
      errorTimestamps.delete(player.guildId);
      player.stopPlaying().catch(() => {});
      return;
    }

    // Auto-skip to next track
    if (player.node?.connected) {
      player.stopPlaying().catch(() => {});
    }
  });

  l.on("playerDisconnect", (player) => {
    state.nowPlaying.delete(player.guildId);
    state.queues.clear(player.guildId);
    lavalink.stopPositionTracking(player.guildId);
    lavalink.uncachePlayer(player.guildId);
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
