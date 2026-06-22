require("dotenv/config");

const { EmbedBuilder } = require("discord.js");
const Colors = require("../constants/Colors");
const Logger = require("./Logger");

const ERROR_CHANNEL_ID = process.env.ERROR_LOG_CHANNEL_ID || null;
let clientRef = null;

function init(client) {
  clientRef = client;
}

function getChannel() {
  if (!clientRef) return null;
  return clientRef.channels.cache.get(ERROR_CHANNEL_ID);
}

function isReady() {
  const ch = getChannel();
  return ch && ch.isTextBased() && !ch.isVoiceBased();
}

async function sendError(title, description, fields = []) {
  if (!isReady()) return;
  try {
    const embed = new EmbedBuilder()
      .setColor(Colors.ERROR)
      .setTitle(title)
      .setDescription(description)
      .setTimestamp();
    if (fields.length) embed.addFields(fields);
    await getChannel().send({ embeds: [embed] });
  } catch (err) {
    Logger.error(`ErrorReporter send failed: ${err.message}`);
  }
}

async function sendInfo(title, description) {
  if (!isReady()) return;
  try {
    const embed = new EmbedBuilder()
      .setColor(Colors.NOWPLAYING)
      .setTitle(title)
      .setDescription(description)
      .setTimestamp();
    await getChannel().send({ embeds: [embed] });
  } catch (err) {
    Logger.error(`ErrorReporter send failed: ${err.message}`);
  }
}

module.exports = { init, sendError, sendInfo };

//======================
// Created by monavia
// Don't change if you don't know
//======================
