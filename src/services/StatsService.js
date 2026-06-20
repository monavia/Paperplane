const TrackPlay = require("../database/models/TrackPlay");
const CommandUsage = require("../database/models/CommandUsage");

function detectSource(track) {
  const uri = track?.info?.uri || "";
  const source = track?.info?.sourceName || "";
  if (source) return source;
  if (uri.includes("spotify.com")) return "spotify";
  if (uri.includes("youtube.com") || uri.includes("youtu.be")) return "youtube";
  if (uri.includes("soundcloud.com")) return "soundcloud";
  if (uri.includes("deezer.com")) return "deezer";
  if (uri.includes("twitch.tv")) return "twitch";
  if (uri.includes("bandcamp.com")) return "bandcamp";
  if (uri.includes("vimeo.com")) return "vimeo";
  return "other";
}

async function recordTrackPlay(guildId, track, playedMs, userId, username) {
  try {
    await TrackPlay.create({
      guildId,
      trackTitle: (track?.info?.title || "Unknown").slice(0, 200),
      trackAuthor: (track?.info?.author || "").slice(0, 100),
      source: detectSource(track),
      duration: track?.info?.duration || 0,
      playedMs: playedMs || 0,
      userId: userId || null,
      username: username || null,
      playedAt: new Date(),
    });
  } catch {}
}

async function recordCommandUsage(guildId, commandName, userId) {
  try {
    await CommandUsage.create({
      guildId,
      commandName: commandName.slice(0, 50),
      userId: userId || null,
      usedAt: new Date(),
    });
  } catch {}
}

async function getStats(guildId, days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [topTracks, topUsers, topCommands, sourceBreakdown] = await Promise.all([
    TrackPlay.aggregate([
      { $match: { guildId, playedAt: { $gte: since } } },
      {
        $group: {
          _id: { title: "$trackTitle", author: "$trackAuthor", source: "$source" },
          totalPlayedMs: { $sum: "$playedMs" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalPlayedMs: -1 } },
      { $limit: 10 },
    ]),

    TrackPlay.aggregate([
      { $match: { guildId, playedAt: { $gte: since }, username: { $ne: null } } },
      {
        $group: {
          _id: { username: "$username", userId: "$userId" },
          totalPlayedMs: { $sum: "$playedMs" },
          trackCount: { $sum: 1 },
        },
      },
      { $sort: { totalPlayedMs: -1 } },
      { $limit: 10 },
    ]),

    CommandUsage.aggregate([
      { $match: { guildId, usedAt: { $gte: since } } },
      { $group: { _id: "$commandName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),

    TrackPlay.aggregate([
      { $match: { guildId, playedAt: { $gte: since } } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    topTracks: topTracks.map((t) => ({
      title: t._id.title,
      author: t._id.author,
      source: t._id.source,
      totalPlayedMs: t.totalPlayedMs,
      plays: t.count,
    })),
    topUsers: topUsers.map((u) => ({
      username: u._id.username,
      totalPlayedMs: u.totalPlayedMs,
      trackCount: u.trackCount,
    })),
    topCommands: topCommands.map((c) => ({
      command: c._id,
      count: c.count,
    })),
    sourceBreakdown: sourceBreakdown.map((s) => ({
      source: s._id,
      count: s.count,
    })),
  };
}

module.exports = { recordTrackPlay, recordCommandUsage, getStats };

//======================
// Created by monavia
// Don't change if you don't know
//======================
