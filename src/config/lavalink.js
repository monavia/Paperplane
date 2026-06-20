require("dotenv/config");

const NODE_NAMES = ["main", "backup", "node3", "node4"];
const DEFAULT_PORTS = [2323, 2324, 2325, 2326];

function readNodeEnv(i) {
  const sfx = i === 0 ? "" : `_${i + 1}`;
  return {
    host: process.env[`LAVALINK_HOST${sfx}`],
    port: Number(process.env[`LAVALINK_PORT${sfx}`]) || DEFAULT_PORTS[i],
    password: process.env[`LAVALINK_PASSWORD${sfx}`] || "youshallnotpass",
    secure: process.env[`LAVALINK_SECURE${sfx}`] === "true",
  };
}

const nodes = NODE_NAMES.map((name, i) => ({ name, ...readNodeEnv(i) }))
  .filter((n) => n.host)
  .map((n) => ({
    name: n.name,
    host: n.host,
    port: n.port,
    authorization: n.password,
    secure: n.secure,
    resumeKey: process.env.LAVALINK_RESUME_KEY || "paperplane",
    resumeTimeout: 120,
    retryAmount: 10,
    retryDelay: 5000,
  }));

module.exports = { nodes };

//======================
// Created by monavia
// Don't change if you don't know
//======================
