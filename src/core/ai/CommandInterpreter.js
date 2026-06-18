class CommandInterpreter {
  interpret(input) {
    const lower = input.toLowerCase().trim();

    // Check no-query commands FIRST so they don't get caught by play pattern
    if (/^(?:help|info|bantuan)\b/i.test(lower)) return { type: "help" };
    if (/^(?:skip|lewati|lompati|lanjut)\b/i.test(lower)) return { type: "skip" };
    if (/^(?:stop|berhenti|matikan|setop)\b/i.test(lower)) return { type: "stop" };
    if (/^(?:pause|jeda|tahan)\b/i.test(lower)) return { type: "pause" };
    if (/^(?:resume|unpause|lanjutkan|mainkan lagi)\b/i.test(lower)) return { type: "resume" };
    if (/^(?:queue|antrian|lagu apa|lagu sekarang)\b/i.test(lower)) return { type: "queue" };

    // Play — needs a query, check last
    const playPattern = /^(?:play|put on|play me|mainkan|putar|cari)\s+(?:lagu\s+)?(.+)/i;
    const playMatch = input.match(playPattern);
    if (playMatch) return { type: "play", query: playMatch[1].trim() };

    return { type: "chat" };
  }
}

module.exports = CommandInterpreter;

//======================
// Created by monavia
// Don't change if you don't know
//======================
