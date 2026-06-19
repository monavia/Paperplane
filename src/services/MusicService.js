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

    if (states.length) Logger.info(`Restored ${states.length} player(s) from saved state`);
  } catch (err) {
    Logger.error("Failed to restore player states:", err.message);
  }
}

async function play(guildId, voiceChannelId, textChannelId, query, user, multi = false) {
  const engine = getEngine(guildId);
  const player = await engine.join(voiceChannelId, textChannelId);
  if (!player) throw new Error("Failed to create player");

  // Intercept Spotify URLs — scrape + search on YouTube
  const spotifyScraper = require("../core/music/SpotifyScraper");
  const spotifyParsed = spotifyScraper.parseUrl(query);

  if (spotifyParsed) {
    const scraped = await spotifyScraper.scrape(query);
    if (!scraped?.length) throw new Error("Tidak bisa mengambil data dari Spotify.");

    const maxTracks = 30;
    const tracksToSearch = scraped.slice(0, maxTracks);
    const allTracks = [];

    for (const item of tracksToSearch) {
      try {
        const result = await player.search({ query: `ytsearch:${item.query}` }, user);
        if (result?.tracks?.length) allTracks.push(result.tracks[0]);
      } catch {}
    }

    if (!allTracks.length) throw new Error("Tidak ada lagu dari Spotify yang bisa diputar.");

    const isPlaylist = allTracks.length > 1;

    if (player.playing || player.paused) {
      engine.queue.addMultiple(allTracks);
    } else {
      engine.queue.clear();
      engine.queue.addMultiple(allTracks);
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
    return {
      engine, player,
      result: { tracks: allTracks, loadType: isPlaylist ? "playlist" : "track" },
      track: allTracks[0],
    };
  }

  const searchQuery = multi && !query.startsWith("ytsearch:") && !query.startsWith("http")
    ? `ytsearch:${query}`
    : query;

  const result = await player.search({ query: searchQuery }, user);
  if (!result?.tracks?.length) throw new Error("No results found");

  const isPlaylist = result.loadType === "playlist";
  const tracks = (isPlaylist || multi) ? result.tracks.slice(0, 20) : [result.tracks[0]];

  if (player.playing || player.paused) {
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
  return { engine, player, result, track: tracks[0] };
}

async function skip(guildId) {
  const engine = getEngine(guildId);
  Logger.info(`[SKIP-SERVICE] skip() called for guild ${guildId}`);
  const result = await engine.playback.skip();
  await saveState(guildId);
  return result;
}

async function stop(guildId) {
  const engine = getEngine(guildId);
  await engine.disconnect();
  await destroyEngine(guildId);
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
