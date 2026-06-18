const lavalink = require("./lavalink");
const state = require("../state/StateManager");
const Logger = require("../utils/Logger");

function register(client) {
  const l = lavalink.get();
  if (!l) return;

  l.on("trackStart", (player, track) => {
    state.nowPlaying.set(player.guildId, track);
    Logger.debug(`Track started in ${player.guildId}: ${track.info.title}`);
  });

  l.on("trackEnd", (player, track, reason) => {
    state.nowPlaying.delete(player.guildId);
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
    }
  });

  l.on("trackError", (player, track, error) => {
    Logger.error(`Track error in ${player.guildId}:`, error.message);
  });

  l.on("playerDisconnect", (player) => {
    state.nowPlaying.delete(player.guildId);
    state.queues.clear(player.guildId);
  });
}

module.exports = { register };

//======================
// Created by monavia
// Don't change if you don't know
//======================
