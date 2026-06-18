const mongoose = require("mongoose");
const dbConfig = require("../config/database");
const Logger = require("../core/utils/Logger");

async function connect() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options);
    Logger.ready("MongoDB connected");
  } catch (err) {
    Logger.error("MongoDB connection error:", err.message);
    throw err;
  }
}

async function disconnect() {
  await mongoose.disconnect();
  Logger.info("MongoDB disconnected");
}

module.exports = { connect, disconnect };

//======================
// Created by monavia
// Don't change if you don't know
//======================
