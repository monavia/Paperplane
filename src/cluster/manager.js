const { ClusterManager } = require("discord.js");
const botConfig = require("../config/bot");
const Logger = require("../core/utils/Logger");

const manager = new ClusterManager(`${__dirname}/../index.js`, {
  token: botConfig.token,
  totalShards: "auto",
  shardList: "auto",
});

manager.on("clusterCreate", (cluster) => {
  Logger.info(`Cluster ${cluster.id} created`);
});

manager.spawn({ timeout: -1 });

//======================
// Created by monavia
// Don't change if you don't know
//======================
