const botConfig = require("../../config/bot");

function createContext(client, source, data) {
  const isSlash = source === "slash";
  const isPrefix = source === "prefix";
  const interaction = isSlash ? data : null;
  const message = isPrefix ? data : (interaction?.isMessageComponent?.() ? interaction.message : null);

  return {
    client,
    interaction,
    message,
    guild: data.guild || interaction?.guild,
    channel: data.channel || interaction?.channel,
    member: data.member || interaction?.member,
    author: data.author || interaction?.user,
    user: data.author || interaction?.user,
    isSlash,
    isPrefix,
    isComponent: !!interaction?.isMessageComponent?.(),
    guildId: (data.guildId || interaction?.guildId),
    channelId: (data.channelId || interaction?.channelId),
    args: data.args || [],
    prefix: botConfig.prefix,
    commandName: data.commandName || interaction?.commandName,
    replied: false,
    deferred: false,
  };
}

module.exports = createContext;

//======================
// Created by monavia
// Don't change if you don't know
//======================
