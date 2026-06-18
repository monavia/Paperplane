function parseDuration(millis) {
  if (!millis || isNaN(millis)) return "0:00";
  const totalSeconds = Math.floor(millis / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function parseTimestamp(text) {
  const parts = text.split(":").map(Number);
  if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000;
  if (parts.length === 1) return parts[0] * 1000;
  return NaN;
}

function progressBar(current, total, length = 16) {
  if (!total || total === 0) return "▬".repeat(length);
  const pos = Math.round((current / total) * length);
  return `${"▬".repeat(Math.max(0, pos))}🔘${"▬".repeat(Math.max(0, length - pos - 1))}`;
}

module.exports = { parseDuration, parseTimestamp, progressBar };
