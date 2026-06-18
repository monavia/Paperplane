const AIEngine = require("./AIEngine");
const CommandInterpreter = require("./CommandInterpreter");

class AIDJ {
  constructor() {
    this.interpreter = new CommandInterpreter();
  }

  async interpret(input) {
    const result = this.interpreter.interpret(input);
    if (result.type !== "chat") return result;

    const systemPrompt =
      "You are a Discord music bot. Reply with ONLY ONE LINE using the formats below. NO explanations, NO song lists, NO extra text.\n" +
      "Formats:\n" +
      "PLAY: <song name>\n" +
      "PLAYLIST: <YouTube search query in English>\n" +
      "SKIP\nSTOP\nPAUSE\nRESUME\nQUEUE\n" +
      "Examples:\n" +
      "User: mainkan lagu nina\nYou: PLAY: lagu nina\n" +
      "User: buatkan playlist untuk game santai\nYou: PLAYLIST: chill gaming music playlist\n" +
      "User: stop\nYou: STOP";

    const reply = await AIEngine.ask("aidj", input, systemPrompt);
    const firstLine = reply.split("\n")[0].trim();

    const playlistMatch = firstLine.match(/^PLAYLIST:\s*(.+)/i);
    if (playlistMatch) return { type: "playlist", query: playlistMatch[1].trim() };

    const playMatch = firstLine.match(/^PLAY:\s*(.+)/i);
    if (playMatch) return { type: "play", query: playMatch[1].trim() };

    if (/^SKIP/i.test(firstLine)) return { type: "skip" };
    if (/^STOP/i.test(firstLine)) return { type: "stop" };
    if (/^PAUSE/i.test(firstLine)) return { type: "pause" };
    if (/^RESUME/i.test(firstLine)) return { type: "resume" };
    if (/^QUEUE/i.test(firstLine)) return { type: "queue" };

    return { type: "chat", reply };
  }
}

module.exports = AIDJ;

//======================
// Created by monavia
// Don't change if you don't know
//======================
