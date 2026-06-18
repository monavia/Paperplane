class CommandInterpreter {
  async interpret(naturalInput) {
    const lower = naturalInput.toLowerCase();
    if (lower.startsWith("play ") || lower.startsWith("play ")) return { type: "play", query: naturalInput.replace(/^(play|put on|play me)\s+/i, "") };
    if (lower.startsWith("skip")) return { type: "skip" };
    if (lower.startsWith("stop")) return { type: "stop" };
    if (lower.startsWith("pause")) return { type: "pause" };
    if (lower.startsWith("resume") || lower.startsWith("unpause")) return { type: "resume" };
    if (lower.startsWith("queue") || lower.startsWith("what's playing")) return { type: "queue" };
    return { type: "chat" };
  }
}

module.exports = CommandInterpreter;

//======================
// Created by monavia
// Don't change if you don't know
//======================
