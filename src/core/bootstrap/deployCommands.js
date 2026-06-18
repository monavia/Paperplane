const { REST, Routes } = require("discord.js");
const botConfig = require("../../config/bot");
const Logger = require("../utils/Logger");

async function deploy(commandsData) {
  if (!botConfig.token || !botConfig.clientId) {
    Logger.warn("Cannot deploy commands: missing DISCORD_TOKEN or CLIENT_ID");
    return;
  }

  const rest = new REST({ version: "10" }).setToken(botConfig.token);

  try {
    let data;
    if (botConfig.guildId) {
      data = await rest.put(
        Routes.applicationGuildCommands(botConfig.clientId, botConfig.guildId),
        { body: commandsData },
      );
    } else {
      data = await rest.put(
        Routes.applicationCommands(botConfig.clientId),
        { body: commandsData },
      );
    }
    Logger.ready(`Deployed ${data.length} slash commands`);
  } catch (err) {
    Logger.error("Failed to deploy commands:", err.message);
    if (err.rawError?.errors) {
      Logger.error("Discord validation errors:", JSON.stringify(err.rawError.errors, null, 2));
    }
    if (err.status) Logger.error("HTTP status:", err.status);
    if (err.code) Logger.error("Error code:", err.code);
    if (err.method && err.url) Logger.error("Request:", err.method, err.url);
  }
}

module.exports = { deploy };

//======================
// Created by monavia
// Don't change if you don't know
//======================
