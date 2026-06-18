const db = require("../../database/connection");
const Logger = require("../utils/Logger");

async function load() {
  try {
    await db.connect();
    return true;
  } catch (err) {
    Logger.warn("Database not available — running without persistence");
    return false;
  }
}

module.exports = { load };

//======================
// Created by monavia
// Don't change if you don't know
//======================
