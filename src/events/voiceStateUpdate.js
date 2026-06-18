const { Events } = require("discord.js");
const { destroyEngine } = require("../services/MusicService");

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    if (oldState.channelId && !newState.channelId) {
      const guildId = oldState.guild.id;
      const botId = oldState.client.user.id;
      const channel = oldState.channel;

      if (channel.members.size === 1 && channel.members.has(botId)) {
        setTimeout(() => {
          if (channel.members.size === 1 && channel.members.has(botId)) {
            destroyEngine(guildId);
          }
        }, 60000);
      }
    }
  },
};
