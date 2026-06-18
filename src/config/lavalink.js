require("dotenv/config");

module.exports = {
  nodes: [
    {
      host: process.env.LAVALINK_HOST || "localhost",
      port: Number(process.env.LAVALINK_PORT) || 2333,
      authorization: process.env.LAVALINK_PASSWORD || "youshallnotpass",
      secure: process.env.LAVALINK_SECURE === "true",
    },
  ],
};
