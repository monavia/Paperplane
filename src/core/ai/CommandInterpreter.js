class CommandInterpreter {
  interpret(input) {
    const lower = input.toLowerCase().trim();

    // Check no-query commands FIRST so they don't get caught by play pattern
    if (/^(?:help|bantuan)\b/i.test(lower)) return { type: "help" };
    if (/^(?:info)\b/i.test(lower)) return { type: "info" };
    if (/^(?:nowplaying|np|lagu sekarang|lagu ini)\b/i.test(lower)) return { type: "nowplaying" };
    if (/^(?:skip|lewati|lompati|lanjut)\b/i.test(lower)) return { type: "skip" };
    if (/^(?:stop|berhenti|matikan|setop)\b/i.test(lower)) return { type: "stop" };
    if (/^(?:pause|jeda|tahan)\b/i.test(lower)) return { type: "pause" };
    if (/^(?:resume|unpause|lanjutkan|mainkan lagi)\b/i.test(lower)) return { type: "resume" };
    if (/^(?:queue|q|antrian|lagu apa|lagu sekarang)\b/i.test(lower)) return { type: "queue" };
    if (/^(?:set\s+)?prefix\b/i.test(lower)) return { type: "prefix" };
    if (/^(?:autoplay|auto.?play|putar otomatis)\b/i.test(lower)) return { type: "autoplay" };
    if (/^(?:shuffle|acak)\b/i.test(lower)) return { type: "shuffle" };
    if (/^(?:loop|ulang)\b/i.test(lower)) return { type: "loop" };
    if (/^(?:seek|lompat)\b/i.test(lower)) return { type: "seek" };
    if (/^(?:volume|vol|suara)\b/i.test(lower)) return { type: "volume" };
    if (/^(?:ping)\b/i.test(lower)) return { type: "ping" };
    if (/^(?:stats|statistik)\b/i.test(lower)) return { type: "stats" };

    // Play — needs a query, check last
    const playPattern = /^(?:play|p|put on|play me|mainkan|putar|cari)\s+(?:lagu\s+)?(.+)/i;
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
