const { parseDuration } = require("./Duration");
const Emojis = require("../constants/Emojis");

function formatTrack(track, index) {
  const title = track.info.title || "Unknown";
  const uri = track.info.uri;
  const duration = parseDuration(track.info.duration);
  const author = track.info.author || "Unknown";
  return `\`${String(index).padStart(2, " ")}\` ${uri ? `[${title}](${uri})` : title} — ${author} \`[${duration}]\``;
}

function formatTrackCompact(track) {
  const title = track.info.title || "Unknown";
  const duration = parseDuration(track.info.duration);
  return `[${title}](${track.info.uri}) \`[${duration}]\``;
}

function formatPlaylist(tracks) {
  return tracks.map((t, i) => formatTrack(t, i + 1)).join("\n");
}

function formatVolume(volume) {
  const bars = Math.round(volume / 10);
  return `${Emojis.VOLUME_UP} ${"█".repeat(bars)}${"░".repeat(10 - bars)} ${volume}%`;
}

module.exports = { formatTrack, formatTrackCompact, formatPlaylist, formatVolume };
