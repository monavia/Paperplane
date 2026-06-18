const { readdirSync } = require("fs");
const { join } = require("path");
const Logger = require("../utils/Logger");

function load(client) {
  const dir = join(__dirname, "../../events");
  const files = readdirSync(dir).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    const event = require(join(dir, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  Logger.ready(`Loaded ${files.length} events`);
}

module.exports = { load };
