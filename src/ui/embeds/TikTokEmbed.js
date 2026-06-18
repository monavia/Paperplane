const { EmbedBuilder } = require("discord.js");
const Colors = require("../../core/constants/Colors");

function liveNotification(username) {
  return new EmbedBuilder()
    .setTitle("🔴 Now Live on TikTok!")
    .setURL(`https://www.tiktok.com/@${username}/live`)
    .setDescription(`**@{username}** is now live!`)
    .addFields({ name: "Watch Now", value: `[Click here](https://www.tiktok.com/@${username}/live)` })
    .setColor(0xFE2C55)
    .setTimestamp();
}

function trackedList(entries, prefix = "!") {
  const desc = entries.length
    ? entries.map((e, i) => `${i + 1}. @${e.username} ${e.isLive ? "🔴 LIVE" : "⚫ Offline"}`).join("\n")
    : `Used command \`${prefix}tiktok add\`, \`${prefix}tiktok list\`, \`${prefix}tiktok remove\``;

  return new EmbedBuilder()
    .setTitle("Tracked TikTok Users")
    .setDescription(desc)
    .setColor(Colors.PRIMARY);
}

module.exports = { liveNotification, trackedList };
