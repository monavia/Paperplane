require("dotenv/config");

module.exports = {
  uri: process.env.DATABASE_URI || "mongodb://localhost:27017/discordbot",
  options: {
    serverSelectionTimeoutMS: 5000,
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
