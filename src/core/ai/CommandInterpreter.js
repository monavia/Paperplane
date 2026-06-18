class CommandInterpreter {
  async interpret(input) {
    const lower = input.toLowerCase().trim();

    // Play — English & Indonesian
    const playPattern = /^(?:play|put on|play me|mainkan|putar|cari)\s+(?:lagu\s+)?(.+)/i;
    const playMatch = input.match(playPattern);
    if (playMatch) return { type: "play", query: playMatch[1].trim() };

    // Skip
    if (/^(?:skip|lewati|lompati|lanjut)\b/i.test(lower)) return { type: "skip" };

    // Stop
    if (/^(?:stop|berhenti|matikan|setop)\b/i.test(lower)) return { type: "stop" };

    // Pause
    if (/^(?:pause|jeda|tahan)\b/i.test(lower)) return { type: "pause" };

    // Resume
    if (/^(?:resume|unpause|lanjutkan|mainkan lagi)\b/i.test(lower)) return { type: "resume" };

    // Queue
    if (/^(?:queue|antrian|lagu apa|lagu sekarang)\b/i.test(lower)) return { type: "queue" };

    return { type: "chat" };
  }
}

module.exports = CommandInterpreter;

//======================
// Created by monavia
// Don't change if you don't know
//======================
