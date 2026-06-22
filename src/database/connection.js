const mongoose = require("mongoose");
const dbConfig = require("../config/database");
const Logger = require("../core/utils/Logger");

let reconnectTimer = null;
let currentUri = dbConfig.uri;

mongoose.connection.on("disconnected", () => {
  Logger.warn("MongoDB disconnected");
  scheduleReconnect();
});

mongoose.connection.on("error", (err) => {
  Logger.error("MongoDB connection error:", err.message);
  scheduleReconnect();
});

mongoose.connection.on("reconnected", () => {
  Logger.ready(`MongoDB reconnected to ${maskUri(currentUri)}`);
});

function maskUri(uri) {
  if (!uri) return "none";
  return uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
}

function getConnectUri() {
  if (mongoose.connection.readyState !== 0) return currentUri;
  if (currentUri === dbConfig.uri && dbConfig.fallbackUri) {
    return currentUri;
  }
  return currentUri;
}

async function tryConnect(uri) {
  try {
    await mongoose.connect(uri, dbConfig.options);
    currentUri = uri;
    return true;
  } catch {
    return false;
  }
}

async function connect() {
  // Try primary
  if (await tryConnect(dbConfig.uri)) {
    Logger.ready(`MongoDB connected (primary: ${maskUri(dbConfig.uri)})`);
    return;
  }

  // Try fallback if available
  if (dbConfig.fallbackUri) {
    Logger.warn("Primary MongoDB unavailable, trying fallback...");
    if (await tryConnect(dbConfig.fallbackUri)) {
      Logger.ready(`MongoDB connected (fallback: ${maskUri(dbConfig.fallbackUri)})`);
      return;
    }
  }

  Logger.error("MongoDB connection failed (primary + fallback)");
  throw new Error("MongoDB connection failed");
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return;

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (mongoose.connection.readyState !== 0) return;

    // Always try primary first on reconnect
    if (currentUri !== dbConfig.uri) {
      Logger.info("Trying primary MongoDB again...");
      if (await tryConnect(dbConfig.uri)) {
        Logger.ready(`MongoDB reconnected to primary: ${maskUri(dbConfig.uri)}`);
        return;
      }
    }

    const targets = [currentUri];
    if (dbConfig.fallbackUri && !targets.includes(dbConfig.fallbackUri)) {
      targets.push(dbConfig.fallbackUri);
    }

    for (const uri of targets) {
      if (await tryConnect(uri)) {
        Logger.ready(`MongoDB reconnected: ${maskUri(uri)}`);
        return;
      }
    }

    Logger.error("MongoDB reconnect failed, retrying in 5s...");
    scheduleReconnect();
  }, 5000);
}

async function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  await mongoose.disconnect();
  Logger.info("MongoDB disconnected");
}

module.exports = { connect, disconnect };

//======================
// Created by monavia
// Don't change if you don't know
//======================
