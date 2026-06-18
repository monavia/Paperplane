require("dotenv/config");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const botConfig = require("./config/bot");
const Logger = require("./core/utils/Logger");
const { loadSlash, loadPrefix, getSlashData } = require("./core/bootstrap/loadCommands");
const { load: loadEvents } = require("./core/bootstrap/loadEvents");
const { load: loadLavalink } = require("./core/bootstrap/loadLavalink");
const { load: loadDatabase } = require("./core/bootstrap/loadDatabase");
const { deploy } = require("./core/bootstrap/deployCommands");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message],
});

loadEvents(client);

client.once("clientReady", async () => {
  loadSlash(client);
  loadPrefix(client);

  await loadLavalink(client);

  const dbAvailable = await loadDatabase();
  if (!dbAvailable) Logger.warn("Running without database — prefix changes won't persist");

  const commandsData = getSlashData(client);
  await deploy(commandsData);

  Logger.ready("Paperplane is ready");

  client.user.setPresence({
    activities: [{ name: "/help | Music & AI", type: 2 }],
    status: "online",
  });
});

async function shutdown() {
  Logger.warn("Shutting down...");

  const { get: getLavalink } = require("./core/music/lavalink");
  const lavalink = getLavalink();
  if (lavalink) {
    for (const [, player] of lavalink.players || []) {
      player.destroy();
    }
    await lavalink.nodeManager?.disconnectAll();
  }

  const { disconnect } = require("./database/connection");
  try { await disconnect(); } catch {}

  client.destroy();
  process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

client.login(botConfig.token);
