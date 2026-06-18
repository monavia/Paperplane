require("dotenv/config");

module.exports = {
  uri: process.env.DATABASE_URI || "mongodb://localhost:27017/discordbot",
  options: {
    serverSelectionTimeoutMS: 5000,
  },
};
