const tiktokConfig = require("../config/tiktok");
const TikTok = require("../database/models/TikTok");
const Guild = require("../database/models/Guild");
const TikTokEmbed = require("../ui/embeds/TikTokEmbed");
const Logger = require("../core/utils/Logger");

let client;
let interval;

function init(discordClient) {
  client = discordClient;
  Logger.info("TikTok notification service initialized");
  start();
}

function start() {
  if (interval) clearInterval(interval);
  interval = setInterval(checkAll, tiktokConfig.checkIntervalMs);
}

function stop() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

let lastCheckLog = 0;

async function checkAll() {
  try {
    const entries = await TikTok.find({});
    if (!entries.length) {
      if (Date.now() - lastCheckLog > 60000) {
        lastCheckLog = Date.now();
      }
      return;
    }

    for (const entry of entries) {
      try {
        await checkUser(entry);
      } catch (err) {
        Logger.debug(`TikTok check failed for @${entry.username}: ${err.message}`);
      }
    }
  } catch (err) {
    Logger.error("TikTok check cycle error:", err.message);
  }
}

async function checkUser(entry) {
  const currentLive = await isLive(entry.username);

  if (currentLive && !entry.isLive) {
    entry.isLive = true;
    entry.lastChecked = new Date();
    await entry.save();

    const guild = client.guilds.cache.get(entry.guildId);
    if (!guild) return;

    const guildConfig = await Guild.findOne({ guildId: entry.guildId });
    const channelId = guildConfig?.tiktokChannel || entry.channelId;
    const channel = guild.channels.cache.get(channelId);
    if (!channel) return;

    const embed = TikTokEmbed.liveNotification(entry.username);
    await channel.send({ embeds: [embed] });
    Logger.info(`@${entry.username} went live — notified in ${entry.guildId}`);
  } else if (!currentLive && entry.isLive) {
    entry.isLive = false;
    entry.lastChecked = new Date();
    await entry.save();
  } else {
    entry.lastChecked = new Date();
    await entry.save();
  }
}

async function isLive(username) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), tiktokConfig.liveCheckTimeout);

  try {
    const res = await fetch(`https://www.tiktok.com/@${username}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) return false;

    const html = await res.text();

    const match = html.match(/<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    if (!match) return false;

    const data = JSON.parse(match[1]);
    const userData = data?.__DEFAULT_SCOPE__?.["webapp.user-detail"];
    if (!userData) return false;

    return !!userData.user?.isLive;
  } catch {
    clearTimeout(timeout);
    return false;
  }
}

async function setChannel(guildId, channelId) {
  await Guild.findOneAndUpdate(
    { guildId },
    { tiktokChannel: channelId },
    { upsert: true },
  );
}

async function getChannel(guildId) {
  const guildConfig = await Guild.findOne({ guildId });
  return guildConfig?.tiktokChannel || null;
}

async function addTrack(guildId, username) {
  const clean = username.replace(/^@/, "").replace(/https?:\/\/(www\.)?tiktok\.com\//, "").replace(/\/?$/, "");

  const guildConfig = await Guild.findOne({ guildId });
  if (!guildConfig?.tiktokChannel) {
    throw new Error("Set notification channel dulu dengan `!tiktok channel #channel`");
  }

  const existing = await TikTok.findOne({ guildId, username: clean });
  if (existing) {
    existing.isLive = false;
    await existing.save();
    return { new: false, username: clean };
  }

  await TikTok.create({ guildId, channelId: guildConfig.tiktokChannel, username: clean });
  return { new: true, username: clean };
}

async function removeTrack(guildId, username) {
  const clean = username.replace(/^@/, "").replace(/https?:\/\/(www\.)?tiktok\.com\//, "").replace(/\/?$/, "");
  const result = await TikTok.deleteOne({ guildId, username: clean });
  return result.deletedCount > 0;
}

async function getTracks(guildId) {
  return TikTok.find({ guildId }).sort({ username: 1 });
}

module.exports = { init, start, stop, setChannel, getChannel, addTrack, removeTrack, getTracks };

//======================
// Created by monavia
// Don't change if you don't know
//======================
