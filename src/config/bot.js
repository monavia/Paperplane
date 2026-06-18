require("dotenv/config");

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  prefix: process.env.PREFIX || "!",
  owners: (process.env.OWNERS || "").split(",").map((s) => s.trim()).filter(Boolean),
};
