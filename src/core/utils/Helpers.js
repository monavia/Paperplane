function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

function escapeMarkdown(text) {
  return String(text).replace(/[_*~`|>#\-=\\]/g, "\\$&");
}

function truncate(text, max = 2000) {
  if (!text || text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatNumber(n) {
  return Number(n).toLocaleString();
}

module.exports = { chunkArray, escapeMarkdown, truncate, shuffle, formatNumber };
