const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const Colors = require("../core/constants/Colors");
const Emojis = require("../core/constants/Emojis");
const { parseDuration, progressBar } = require("../core/utils/Duration");
const { formatTrackCompact, formatVolume } = require("../core/utils/Formatter");

function nowPlaying(track, player) {
  const pos = player?.position || 0;
  const dur = track.info.duration;
  const bar = progressBar(pos, dur);

  return new EmbedBuilder()
    .setTitle(`${Emojis.MUSIC} Now Playing`)
    .setDescription(`**[${track.info.title}](${track.info.uri})**\n${track.info.author || ""}`)
    .addFields(
      { name: "Progress", value: `${parseDuration(pos)} ${bar} ${parseDuration(dur)}`, inline: false },
      { name: "Volume", value: formatVolume(player?.volume || 80), inline: true },
    )
    .setThumbnail(track.info.artworkUrl || null)
    .setColor(Colors.NOWPLAYING);
}

function queue(tracks, page = 1) {
  const perPage = 10;
  const totalPages = Math.ceil(tracks.length / perPage) || 1;
  const start = (page - 1) * perPage;
  const slice = tracks.slice(start, start + perPage);

  const desc = slice.length
    ? slice.map((t, i) => `\`${start + i + 1}.\` ${formatTrackCompact(t)}`).join("\n")
    : "Queue is empty.";

  return new EmbedBuilder()
    .setTitle(`${Emojis.QUEUE} Queue`)
    .setDescription(desc)
    .setFooter({ text: `Page ${page}/${totalPages} • ${tracks.length} tracks` })
    .setColor(Colors.PRIMARY);
}

function error(text) {
  return new EmbedBuilder().setDescription(`${Emojis.ERROR} ${text}`).setColor(Colors.ERROR);
}

function success(text) {
  return new EmbedBuilder().setDescription(text).setColor(Colors.SUCCESS);
}

function info(title, text) {
  return new EmbedBuilder().setTitle(title).setDescription(text).setColor(Colors.INFO);
}

function ai(prompt, answer) {
  return new EmbedBuilder()
    .setTitle(`${Emojis.AI} AI Response`)
    .setDescription(answer)
    .setFooter({ text: `Prompt: ${prompt.slice(0, 100)}` })
    .setColor(Colors.AI);
}

function ping(latency, apiLatency) {
  return new EmbedBuilder()
    .setTitle(`${Emojis.PING} Ping`)
    .addFields(
      { name: "Bot Latency", value: `${latency}ms`, inline: true },
      { name: "API Latency", value: `${apiLatency}ms`, inline: true },
    )
    .setColor(Colors.PING);
}

function stats(client) {
  const guilds = client.guilds.cache.size;
  const users = client.users.cache.size;
  const channels = client.channels.cache.size;
  const uptime = parseDuration(client.uptime);

  return new EmbedBuilder()
    .setTitle(`${Emojis.STATS} Bot Statistics`)
    .addFields(
      { name: "Servers", value: String(guilds), inline: true },
      { name: "Users", value: String(users), inline: true },
      { name: "Channels", value: String(channels), inline: true },
      { name: "Uptime", value: uptime, inline: true },
      { name: "Ping", value: `${client.ws.ping}ms`, inline: true },
    )
    .setColor(Colors.STATS);
}

module.exports = { nowPlaying, queue, error, success, info, ai, ping, stats };

//======================
// Created by monavia
// Don't change if you don't know
//======================
