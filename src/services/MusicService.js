const MusicEngine = require("../core/music/MusicEngine");
const Logger = require("../core/utils/Logger");
const PlayerState = require("../database/models/PlayerState");

const engines = new Map();

function getEngine(guildId) {
  if (!engines.has(guildId)) engines.set(guildId, new MusicEngine(guildId));
  return engines.get(guildId);
}

async function destroyEngine(guildId) {
  const engine = engines.get(guildId);
  if (engine) {
    engine.queue.clear();
  }
  engines.delete(guildId);
  await deleteState(guildId);
}

async function saveState(guildId) {
  try {
    const engine = getEngine(guildId);
    const player = engine.player;
    if (!player) return;

    const voiceChannelId = player.voiceChannelId;
    if (!voiceChannelId) return;

    const nowPlaying = engine.getCurrentTrack();
    const queue = engine.queue.getAll();

    await PlayerState.findOneAndUpdate(
      { guildId },
      {
        guildId,
        voiceChannelId,
        textChannelId: player.textChannelId,
        queue: queue.map(t => JSON.parse(JSON.stringify(t))),
        nowPlaying: nowPlaying ? JSON.parse(JSON.stringify(nowPlaying)) : null,
        updatedAt: new Date(),
      },
      { upsert: true },
    );
  } catch (err) {
    Logger.error(`Failed to save player state for ${guildId}:`, err.message);
  }
}

async function deleteState(guildId) {
  try {
    await PlayerState.deleteOne({ guildId });
  } catch {}
}

async function restoreAllStates(client) {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Clean up stale states (>5 min) that won't be restored
    await PlayerState.deleteMany({ updatedAt: { $lt: fiveMinAgo } });

    const states = await PlayerState.find({ updatedAt: { $gte: fiveMinAgo } });

    for (const state of states) {
      const guild = client.guilds.cache.get(state.guildId);
      if (!guild) {
        await PlayerState.deleteOne({ guildId: state.guildId });
        continue;
      }

      const voiceChannel = guild.channels.cache.get(state.voiceChannelId);
      if (!voiceChannel?.isVoiceBased()) {
        await PlayerState.deleteOne({ guildId: state.guildId });
        continue;
      }

      const engine = getEngine(state.guildId);
      const player = await engine.join(state.voiceChannelId, state.textChannelId);
      if (!player) {
        await PlayerState.deleteOne({ guildId: state.guildId });
        continue;
      }

      // Check if bot is alone in voice channel after rejoin
      if (voiceChannel.members.size === 1 && voiceChannel.members.has(client.user.id)) {
        Logger.info(`Bot alone in voice after restore for ${state.guildId}, starting disconnect timer`);
        setTimeout(async () => {
          const ch = guild.channels.cache.get(state.voiceChannelId);
          if (ch?.members?.size === 1 && ch.members.has(client.user.id)) {
            await destroyEngine(state.guildId);
          }
        }, 120000);
        continue;
      }

      // Check if Lavalink resume already restored a playing track
      let resumedTrackActive = false;
      const node = player?.node;
      if (node?.connected) {
        try {
          const remote = await node.fetchPlayer(state.guildId);
          resumedTrackActive = remote?.track?.encoded != null;
        } catch {}
      }

      if (resumedTrackActive) {
        // Resume is active — queue will auto-advance when resumed track finishes
        if (state.queue?.length) {
          for (const t of state.queue) {
            engine.queue.add(t);
          }
        }
        Logger.info(`Resume active for ${state.guildId}, restored ${engine.queue.size()} queued tracks`);
      } else {
        // No resume — restore nowPlaying + queue and play the first track
        const tracks = [];
        if (state.nowPlaying) tracks.push(state.nowPlaying);
        if (state.queue?.length) tracks.push(...state.queue);

        for (const track of tracks) {
          engine.queue.add(track);
        }

        const first = engine.queue.next();
        if (first) {
          try {
            await player.play({ track: first, clientTrack: first });
          } catch (err) {
            Logger.error(`Restore playback failed for ${state.guildId}:`, err.message);
          }
        }

        Logger.info(`Restored player state for guild ${state.guildId}`);
      }
    }

    if (states.length) Logger.info(`Restored ${states.length} player(s) from saved state`);
  } catch (err) {
    Logger.error("Failed to restore player states:", err.message);
  }
}

async function searchWithRetry(player, searchOpts, user, retries = 1) {
  const query = searchOpts.query || searchOpts;
  const nodeName = player.node?.name || "unknown";
  const start = Date.now();
  Logger.debug(`[SEARCH] node=${nodeName} query="${query?.slice(0, 80)}" attempt=1`);

  for (let i = 0; i <= retries; i++) {
    try {
      const result = await player.search(searchOpts, user);
      Logger.debug(`[SEARCH] node=${nodeName} query="${query?.slice(0, 80)}" ok ms=${Date.now() - start} tracks=${result?.tracks?.length || 0}`);
      return result;
    } catch (err) {
      Logger.debug(`[SEARCH] node=${nodeName} query="${query?.slice(0, 80)}" fail ms=${Date.now() - start} err="${err.message}"`);
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      throw err;
    }
  }
}

async function play(guildId, voiceChannelId, textChannelId, query, user, multi = false) {
  const engine = getEngine(guildId);
  const player = await engine.join(voiceChannelId, textChannelId);
  if (!player) throw new Error("Failed to create player");
  Logger.debug(`[PLAY] guild=${guildId} node=${player.node?.name || "none"} query="${(query || "").slice(0, 80)}"`);

  // Intercept Spotify URLs — scrape HTML + search on YouTube
  const spotifyScraper = require("../core/music/SpotifyScraper");
  const spotifyParsed = spotifyScraper.parseUrl(query);

  if (spotifyParsed) {
    const scraped = await spotifyScraper.scrape(query);
    if (!scraped?.length) throw new Error("Could not fetch data from Spotify.");

    const maxTracks = 500;
    const tracksToSearch = scraped.slice(0, maxTracks);

    // Resolve all tracks — prefer YouTube Music (official releases)
    function pickBestMatch(tracks, expectedMs) {
      if (!tracks?.length) return null;
      if (!expectedMs || tracks.length === 1) return tracks[0];
      let best = tracks[0];
      let bestDiff = Math.abs((tracks[0].info?.duration || 0) - expectedMs);
      for (let i = 1; i < tracks.length; i++) {
        const diff = Math.abs((tracks[i].info?.duration || 0) - expectedMs);
        if (diff < bestDiff) { best = tracks[i]; bestDiff = diff; }
      }
      return best;
    }

    async function searchWithFallback(player, item, user) {
      for (const prefix of ["ytsearch", "scsearch"]) {
        const result = await searchWithRetry(player, { query: `${prefix}:${item.query}` }, user, 0);
        if (result?.tracks?.length) {
          const best = pickBestMatch(result.tracks, item.duration);
          return best;
        }
      }
      return null;
    }

    const allTracks = [];
    const batchSize = 20;
    for (let b = 0; b < tracksToSearch.length; b += batchSize) {
      const batch = tracksToSearch.slice(b, b + batchSize);
      const results = await Promise.allSettled(
        batch.map((item) => searchWithFallback(player, item, user)),
      );
      for (const r of results) {
        if (r.status === "fulfilled" && r.value) allTracks.push(r.value);
      }
    }

    if (!allTracks.length) throw new Error("No playable tracks found from Spotify.");

    const wasPlaying = player.playing || player.paused;

    if (wasPlaying) {
      engine.queue.addMultiple(allTracks);
    } else {
      engine.queue.clear();
      engine.queue.addMultiple(allTracks);
      const first = engine.queue.next();
      if (first) {
        try {
          await player.play({ track: first, clientTrack: first });
        } catch (err) {
          Logger.error("Playback failed:", err.message);
          throw new Error(`Failed to play: ${err.message}`);
        }
      }
    }

    await saveState(guildId);

    return {
      engine, player,
      result: { tracks: allTracks, loadType: allTracks.length > 1 ? "playlist" : "track", spotifyTotal: allTracks.length },
      track: allTracks[0],
      wasPlaying,
    };
  }

  let searchQuery = query;
  if (!query.startsWith("http") && !query.includes(":")) {
    searchQuery = `ytsearch:${query}`;
  }

  const result = await searchWithRetry(player, { query: searchQuery }, user);
  if (!result?.tracks?.length) throw new Error("No results found");

  const isPlaylist = result.loadType === "playlist";
  const tracks = (isPlaylist || multi) ? result.tracks.slice(0, 20) : [result.tracks[0]];

  const wasPlaying = player.playing || player.paused;

  if (wasPlaying) {
    engine.queue.addMultiple(tracks);
  } else {
    engine.queue.clear();
    engine.queue.addMultiple(tracks);
    const first = engine.queue.next();
    if (!first) throw new Error("No tracks to play");
    try {
      await player.play({ track: first, clientTrack: first });
    } catch (err) {
      Logger.error("Playback failed:", err.message);
      throw new Error(`Failed to play: ${err.message}`);
    }
  }

  await saveState(guildId);
  return { engine, player, result, track: tracks[0], wasPlaying };
}

async function skip(guildId) {
  const engine = getEngine(guildId);
  const result = await engine.playback.skip();
  await saveState(guildId);
  return result;
}

async function stop(guildId) {
  const engine = getEngine(guildId);
  await engine.playback.stop();
  await saveState(guildId);
}

async function pause(guildId) {
  const engine = getEngine(guildId);
  return engine.playback.pause();
}

async function resume(guildId) {
  const engine = getEngine(guildId);
  return engine.playback.resume();
}

function setVolume(guildId, volume) {
  const engine = getEngine(guildId);
  return engine.playback.setVolume(volume);
}

function getQueue(guildId) {
  const engine = getEngine(guildId);
  const current = engine.player?.queue?.current;
  const upcoming = engine.queue.getAll();
  if (!current) return upcoming;
  return [current, ...upcoming];
}

async function shuffle(guildId) {
  const engine = getEngine(guildId);
  engine.queue.shuffle();
  await saveState(guildId);
}

module.exports = {
  getEngine, destroyEngine, play, skip, stop, pause, resume, setVolume, getQueue, shuffle,
  restoreAllStates, saveState, deleteState,
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
