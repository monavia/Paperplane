require("dotenv/config");

module.exports = {
  uri: process.env.DATABASE_URI || "mongodb://localhost:27017/discordbot",
  fallbackUri: process.env.DATABASE_URI_FALLBACK || null,
  activeUri: process.env.DATABASE_URI || "mongodb://localhost:27017/discordbot",
  options: {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
