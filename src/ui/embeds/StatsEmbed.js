const { EmbedBuilder, version } = require("discord.js");
const Colors = require("../../core/constants/Colors");
const Emojis = require("../../core/constants/Emojis");
const { parseDuration } = require("../../core/utils/Duration");
const { formatNumber } = require("../../core/utils/Helpers");

function build(client) {
  const guilds = formatNumber(client.guilds.cache.size);
  const users = formatNumber(client.users.cache.size);
  const channels = formatNumber(client.channels.cache.size);
  const uptime = parseDuration(client.uptime);
  const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

  return new EmbedBuilder()
    .setTitle(`${Emojis.STATS} Bot Statistics`)
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: `${Emojis.SERVER} Servers`, value: guilds, inline: true },
      { name: `${Emojis.USER} Users`, value: users, inline: true },
      { name: `${Emojis.QUEUE} Channels`, value: channels, inline: true },
      { name: `${Emojis.TIME} Uptime`, value: uptime, inline: true },
      { name: `${Emojis.PING} Ping`, value: `${client.ws.ping}ms`, inline: true },
      { name: `${Emojis.SAVE} Memory`, value: `${memory} MB`, inline: true },
      { name: "Discord.js", value: `v${version}`, inline: true },
      { name: "Node.js", value: process.version, inline: true },
    )
    .setColor(Colors.STATS);
}

module.exports = { build };

//======================
// Created by monavia
// Don't change if you don't know
//======================
