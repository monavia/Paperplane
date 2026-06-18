const AIEngine = require("./AIEngine");
const CommandInterpreter = require("./CommandInterpreter");

function isMusicQuery(input) {
  return /(?:lagu|musik|song|playlist|putar|mainkan|dengar|rekomend|recommend|mood|suasana|genre|tema|santai|semangat|sedih|galau|party|chill|nina|cipta|dendang|nyanyi|beat|rhythm|melody|tone)/i.test(input);
}

class AIDJ {
  constructor() {
    this.interpreter = new CommandInterpreter();
  }

  async interpret(input) {
    const result = await this.interpreter.interpret(input);
    if (result.type !== "chat") return result;

    // Only hit Ollama for music-related queries; generic chat goes directly to AI assistant
    if (!isMusicQuery(input)) return { type: "chat" };

    const systemPrompt =
      "You are a Discord music bot. Reply with ONLY ONE LINE. You MUST recommend 30-50 songs in a single PLAYLIST line.\n" +
      "Formats:\n" +
      "PLAY: <song name>\n" +
      "PLAYLIST: <song1> by <artist1>, <song2> by <artist2>, <song3> by <artist3>, ... (minimum 30 songs)\n" +
      "SKIP\nSTOP\nPAUSE\nRESUME\nQUEUE\n" +
      "Examples:\n" +
      'User: mainkan lagu nina\nYou: PLAY: lagu nina\n' +
      'User: buatkan playlist untuk game santai\nYou: PLAYLIST: Midnight City by M83, A Walk by Tycho, Your Hand in Mine by Explosions in the Sky, Eple by Royksopp, Awake by Tycho, First Breath by Com Truise, Dayvan Cowboy by Boards of Canada, Stockholm by The Field, Kettering by The Antlers, Holocene by Bon Iver, Blood Bank by Bon Iver, Re:Stacks by Bon Iver, Perth by Bon Iver, Calgary by Bon Iver, Lisbon by Bon Iver\n' +
      "User: stop\nYou: STOP";

    AIEngine.clearMemory("aidj");
    const reply = await AIEngine.ask("aidj", input, systemPrompt);
    const firstLine = reply.split("\n")[0].trim();

    const playlistMatch = firstLine.match(/^PLAYLIST:\s*(.+)/i);
    if (playlistMatch) {
      const raw = playlistMatch[1].trim();
      const songs = raw.split(",").map((s) => s.trim()).filter(Boolean);
      return { type: "playlist", songs };
    }

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
