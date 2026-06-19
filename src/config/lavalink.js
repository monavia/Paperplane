require("dotenv/config");

const nodes = [
  {
    name: "main",
    host: process.env.LAVALINK_HOST || "localhost",
    port: Number(process.env.LAVALINK_PORT) || 2333,
    authorization: process.env.LAVALINK_PASSWORD || "youshallnotpass",
    secure: process.env.LAVALINK_SECURE === "true",
    resumeKey: process.env.LAVALINK_RESUME_KEY || "paperplane",
    resumeTimeout: 120,
    retryAmount: 10,
    retryDelay: 5000,
  },
];

if (process.env.LAVALINK_HOST_2) {
  nodes.push({
    name: "backup",
    host: process.env.LAVALINK_HOST_2,
    port: Number(process.env.LAVALINK_PORT_2) || 2334,
    authorization: process.env.LAVALINK_PASSWORD_2 || "youshallnotpass",
    secure: process.env.LAVALINK_SECURE_2 === "true",
    resumeKey: process.env.LAVALINK_RESUME_KEY || "paperplane",
    resumeTimeout: 120,
    retryAmount: 10,
    retryDelay: 5000,
  });
}

module.exports = { nodes };

//======================
// Created by monavia
// Don't change if you don't know
//======================
