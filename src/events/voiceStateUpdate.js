const { Events, EmbedBuilder } = require("discord.js");
const { getEngine, destroyEngine } = require("../services/MusicService");
const Colors = require("../core/constants/Colors");

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    if (!oldState.channelId && !newState.channelId) return;
    const guildId = oldState.guild.id || newState.guild.id;
    const botId = oldState.client.user.id;

    // Bot was forcefully disconnected from voice
    if (oldState.channelId && !newState.channelId && oldState.member.user.id === botId) {
      const engine = getEngine(guildId);
      const player = engine?.player;
      if (player?.textChannelId) {
        const channel = oldState.client.channels.cache.get(player.textChannelId);
        if (channel) {
          const embed = new EmbedBuilder()
            .setColor(Colors.ERROR)
            .setDescription("Bot terputus dari voice channel.");
          channel.send({ embeds: [embed] }).catch(() => {});
        }
      }
      await destroyEngine(guildId);
      return;
    }

    // All users left; clean up after 60s if bot is alone
    if (oldState.channelId && !newState.channelId) {
      const channel = oldState.channel;
      if (channel.members.size === 1 && channel.members.has(botId)) {
        setTimeout(async () => {
          if (channel.members.size === 1 && channel.members.has(botId)) {
            await destroyEngine(guildId);
          }
        }, 60000);
      }
    }
  },
};
