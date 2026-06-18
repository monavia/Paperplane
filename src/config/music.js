require("dotenv/config");

module.exports = {
  defaultVolume: Number(process.env.DEFAULT_VOLUME) || 80,
  maxQueueSize: Number(process.env.MAX_QUEUE_SIZE) || 500,
  autoLeave: true,
  autoLeaveCooldown: 60000,
  defaultSearchPlatform: "ytsearch",
};
