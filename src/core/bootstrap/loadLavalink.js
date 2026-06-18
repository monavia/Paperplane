const lavalink = require("../music/lavalink");
const { register: registerMusicEvents } = require("../music/musicEvents");
const Logger = require("../utils/Logger");

async function load(client) {
  try {
    await lavalink.init(client);
    registerMusicEvents(client);
  } catch (err) {
    Logger.error("Failed to initialize Lavalink:", err.message);
  }
}

module.exports = { load };
