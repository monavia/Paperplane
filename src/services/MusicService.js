const MusicEngine = require("../core/music/MusicEngine");
const Logger = require("../core/utils/Logger");

const engines = new Map();

function getEngine(guildId) {
  if (!engines.has(guildId)) engines.set(guildId, new MusicEngine(guildId));
  return engines.get(guildId);
}

function destroyEngine(guildId) {
  engines.delete(guildId);
}

async function play(guildId, voiceChannelId, textChannelId, query, user) {
  const engine = getEngine(guildId);
  const player = await engine.join(voiceChannelId, textChannelId);
  if (!player) throw new Error("Failed to create player");

  const result = await player.search({ query }, user);
  if (!result?.tracks?.length) throw new Error("No results found");

  const isPlaylist = result.loadType === "playlist";
  const tracks = isPlaylist ? result.tracks : [result.tracks[0]];

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

  return { engine, player, result, track: tracks[0] };
}

async function skip(guildId) {
  const engine = getEngine(guildId);
  return engine.playback.skip();
}

async function stop(guildId) {
  const engine = getEngine(guildId);
  await engine.disconnect();
  destroyEngine(guildId);
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
  return engine.queue.getAll();
}

function shuffle(guildId) {
  const engine = getEngine(guildId);
  engine.queue.shuffle();
}

module.exports = {
  getEngine, destroyEngine, play, skip, stop, pause, resume, setVolume, getQueue, shuffle,
};
