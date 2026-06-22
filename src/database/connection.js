const mongoose = require("mongoose");
const dbConfig = require("../config/database");
const Logger = require("../core/utils/Logger");

let reconnectTimer = null;

mongoose.connection.on("disconnected", () => {
  Logger.warn("MongoDB disconnected");
  scheduleReconnect();
});

mongoose.connection.on("error", (err) => {
  Logger.error("MongoDB connection error:", err.message);
  scheduleReconnect();
});

mongoose.connection.on("reconnected", () => {
  Logger.ready("MongoDB reconnected");
});

async function connect() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options);
    Logger.ready("MongoDB connected");
  } catch (err) {
    Logger.error("MongoDB connection error:", err.message);
    throw err;
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return;
  Logger.info("MongoDB reconnecting in 5s...");
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(dbConfig.uri, dbConfig.options);
        Logger.ready("MongoDB reconnected");
      }
    } catch (err) {
      Logger.error("MongoDB reconnect failed:", err.message);
      scheduleReconnect();
    }
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
