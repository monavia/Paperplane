const lavalink = require("./lavalink");
const state = require("../state/StateManager");
const Logger = require("../utils/Logger");
const { EmbedBuilder } = require("discord.js");
const Colors = require("../constants/Colors");

const disconnectTimers = new Map();

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
      position: 0,
      volume: player.volume,
    });

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
    state.nowPlaying.delete(player.guildId);
    lavalink.cachePlayer(player.guildId, {
      voiceChannelId: player.voiceChannelId,
      textChannelId: player.textChannelId,
      currentTrack: null,
      position: 0,
      volume: player.volume,
    });
  });

  l.on("queueEnd", (player, track, payload) => {
    state.nowPlaying.delete(player.guildId);

    const queue = state.queues.get(player.guildId);
    if (queue.length > 0) {
      const next = queue.shift();
      state.queues.set(player.guildId, queue);
      state.nowPlaying.set(player.guildId, next);
      player.play({ track: next, clientTrack: next }).catch(err => {
        Logger.error(`Failed to play next: ${next.info.title} — ${err.message}`);
      });
      return;
    }

    // Queue is empty — start 3-minute disconnect timer
    if (player.textChannelId) {
      const channel = client.channels.cache.get(player.textChannelId);
      if (channel) {
        const embed = new EmbedBuilder()
          .setDescription("Antrian selesai. Bot akan disconnect otomatis 3 menit lagi.")
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
    Logger.error(`Track error in ${player.guildId}:`, error.message);
  });

  l.on("playerDisconnect", (player) => {
    state.nowPlaying.delete(player.guildId);
    state.queues.clear(player.guildId);
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
