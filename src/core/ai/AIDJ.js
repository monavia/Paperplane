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
      "You are a Discord music bot. Understand both English and Indonesian.\n" +
      "If user wants to play music (e.g. 'mainkan lagu X', 'putar X', play X), reply: PLAY: <song name>\n" +
      "For skip/lewati: SKIP\nFor stop/berhenti: STOP\nFor pause/jeda: PAUSE\nFor resume/lanjutkan: RESUME\nFor queue/antrian: QUEUE\n" +
      "If it's a general question or conversation, just reply naturally and concisely.";

    const reply = await AIEngine.ask("aidj", input, systemPrompt);

    const playMatch = reply.match(/^PLAY:\s*(.+)/i);
    if (playMatch) return { type: "play", query: playMatch[1].trim() };

    if (/^SKIP/i.test(reply)) return { type: "skip" };
    if (/^STOP/i.test(reply)) return { type: "stop" };
    if (/^PAUSE/i.test(reply)) return { type: "pause" };
    if (/^RESUME/i.test(reply)) return { type: "resume" };
    if (/^QUEUE/i.test(reply)) return { type: "queue" };

    return { type: "chat", reply };
  }
}

module.exports = AIDJ;

//======================
// Created by monavia
// Don't change if you don't know
//======================
