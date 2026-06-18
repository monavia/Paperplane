const PingEmbed = require("../../../ui/embeds/PingEmbed");
const LoadingEmbed = require("../../../ui/embeds/LoadingEmbed");

module.exports = {
  name: "ping",
  async execute(message, args) {
    const sent = await message.channel.send({ embeds: [LoadingEmbed.build("Pinging...")] });
    const botLatency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = message.client.ws.ping;
    await sent.edit({ content: null, embeds: [PingEmbed.build(botLatency, apiLatency)] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
