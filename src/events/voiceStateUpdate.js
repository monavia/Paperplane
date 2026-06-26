const { Events, EmbedBuilder } = require("discord.js");
const { getEngine, destroyEngine } = require("../services/MusicService");
const Colors = require("../core/constants/Colors");
const Logger = require("../core/utils/Logger");

const disconnectTimers = new Map();

function clearDisconnectTimer(guildId) {
  const timer = disconnectTimers.get(guildId);
  if (timer) {
    clearTimeout(timer);
    disconnectTimers.delete(guildId);
  }
}

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    if (!oldState.channelId && !newState.channelId) return;
    const guildId = oldState.guild.id || newState.guild.id;
    const botId = oldState.client.user.id;

    // Bot was forcefully disconnected from voice
    if (oldState.channelId && !newState.channelId && oldState.member.user.id === botId) {
      clearDisconnectTimer(guildId);
      const engine = getEngine(guildId);
      const player = engine?.player;
      if (player?.textChannelId) {
        const channel = oldState.client.channels.cache.get(player.textChannelId);
        if (channel) {
          const embed = new EmbedBuilder()
            .setColor(Colors.ERROR)
            .setDescription("Bot disconnected from voice channel.");
          channel.send({ embeds: [embed] }).catch(() => {});
        }
      }
      await destroyEngine(guildId);
      return;
    }

    // Cancel timer if someone rejoins while bot is alone
    if (newState.channelId) {
      clearDisconnectTimer(guildId);
    }

    // All users left; clean up after 1m if bot is alone
    if (oldState.channelId && !newState.channelId) {
      const channel = oldState.channel;
      if (channel.members.size === 1 && channel.members.has(botId)) {
        Logger.info(`Bot alone in voice ${guildId}, disconnect timer started`);
        clearDisconnectTimer(guildId);
        const { sendInfo } = require("../core/utils/ErrorReporter");
        sendInfo("Bot left alone in voice", `Guild: \`${guildId}\`\nChannel: **${channel.name}** — disconnecting in 1m`).catch(() => {});
        const timer = setTimeout(async () => {
          disconnectTimers.delete(guildId);
          if (channel.members.size === 1 && channel.members.has(botId)) {
            await destroyEngine(guildId);
          }
        }, 60000);
        disconnectTimers.set(guildId, timer);
      }
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
