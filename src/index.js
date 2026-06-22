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

let heartbeatTimer;

loadEvents(client);

client.once("clientReady", async () => {
  loadSlash(client);
  loadPrefix(client);

  await loadLavalink(client);

  const dbAvailable = await loadDatabase();
  if (!dbAvailable) Logger.warn("Running without database — prefix changes won't persist");

  try {
    const res = await fetch(`${require("./config/ai").host}/api/version`);
    if (res.ok) Logger.ready(`Ollama connected (v${(await res.json()).version})`);
    else Logger.warn("Ollama server unreachable — AI features disabled");
  } catch {
    Logger.warn("Ollama server unreachable — AI features disabled");
  }

  if (dbAvailable) {
    const { restoreAllStates, saveState } = require("./services/MusicService");
    await restoreAllStates(client);

    heartbeatTimer = setInterval(() => {
      const { get: getLavalink } = require("./core/music/lavalink");
      const lavalink = getLavalink();
      if (lavalink?.players) {
        for (const [guildId] of lavalink.players) {
          saveState(guildId);
        }
      }
    }, 30000);
  } else {
    Logger.warn("Database required for TikTok notifications — skipping");
  }

  const commandsData = getSlashData(client);
  await deploy(commandsData);

  if (process.env.DASHBOARD_ENABLED === "true") {
    const { start: startDashboard } = require("./dashboard/server");
    startDashboard(client);
  }

  Logger.ready("Paperplane is ready");

  client.user.setPresence({
    activities: [{ name: `${botConfig.prefix}help | ${botConfig.trigger}`, type: 2 }],
      status: "online",
  });
});

async function shutdown() {
  Logger.warn("Shutting down...");

  if (heartbeatTimer) clearInterval(heartbeatTimer);

  const { saveState } = require("./services/MusicService");

  const { get: getLavalink } = require("./core/music/lavalink");
  const lavalink = getLavalink();
  if (lavalink) {
    for (const [guildId, player] of lavalink.players || []) {
      await saveState(guildId);
      try { player.destroy(); } catch {}
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

//======================
// Created by monavia
// Don't change if you don't know
//======================
