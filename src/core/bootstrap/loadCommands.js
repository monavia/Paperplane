const { readdirSync } = require("fs");
const { join } = require("path");
const Logger = require("../utils/Logger");

function loadSlash(client) {
  const commands = new Map();
  const categories = ["music", "ai", "system"];
  const base = join(__dirname, "../../commands/slash");

  for (const category of categories) {
    const dir = join(base, category);
    try {
      const files = readdirSync(dir).filter((f) => f.endsWith(".js"));
      for (const file of files) {
        const cmd = require(join(dir, file));
        if (cmd.data?.name) {
          commands.set(cmd.data.name, cmd);
        }
      }
    } catch {
      // dir may not exist
    }
  }

  client.slashCommands = commands;
  Logger.ready(`Loaded ${commands.size} slash commands`);
  return commands;
}

function loadPrefix(client) {
  const commands = new Map();
  const categories = ["music", "ai", "system"];
  const base = join(__dirname, "../../commands/prefix");

  for (const category of categories) {
    const dir = join(base, category);
    try {
      const files = readdirSync(dir).filter((f) => f.endsWith(".js"));
      for (const file of files) {
        const cmd = require(join(dir, file));
        if (cmd.name) {
          commands.set(cmd.name, cmd);
          if (Array.isArray(cmd.aliases)) {
            for (const alias of cmd.aliases) {
              commands.set(alias, cmd);
            }
          }
        }
      }
    } catch {
      // dir may not exist
    }
  }

  client.prefixCommands = commands;
  Logger.ready(`Loaded ${commands.size} prefix commands`);
  return commands;
}

function getSlashData(client) {
  return [...client.slashCommands.values()].map((c) => c.data.toJSON());
}

module.exports = { loadSlash, loadPrefix, getSlashData };
