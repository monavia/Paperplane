const AIEngine = require("./AIEngine");
const CommandInterpreter = require("./CommandInterpreter");

class AIDJ {
  constructor() {
    this.interpreter = new CommandInterpreter();
  }

  async interpret(input) {
    const result = this.interpreter.interpret(input);
    if (result.type !== "chat") return result;

    const reply = await AIEngine.ask("aidj", input,
      "You are a Discord bot that can execute music commands. If the user wants to play music, respond with exactly: PLAY: <song name>\n" +
      "For skip: SKIP\nFor stop: STOP\nFor pause: PAUSE\nFor resume: RESUME\nFor queue: QUEUE\n" +
      "If it's a general question or conversation, just reply naturally and concisely."
    );

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
