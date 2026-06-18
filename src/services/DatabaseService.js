const mongoose = require("mongoose");
const dbConfig = require("../config/database");
const Logger = require("../core/utils/Logger");

let connected = false;

async function connect() {
  if (connected) return;
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options);
    connected = true;
    Logger.info("Database connected");
  } catch (err) {
    Logger.error("Database connection failed:", err.message);
    throw err;
  }
}

async function disconnect() {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
  Logger.info("Database disconnected");
}

function isConnected() {
  return connected;
}

module.exports = { connect, disconnect, isConnected };
