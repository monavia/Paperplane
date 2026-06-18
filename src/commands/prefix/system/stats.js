const StatsEmbed = require("../../../ui/embeds/StatsEmbed");

module.exports = {
  name: "stats",
  async execute(message, args) {
    await message.channel.send({ embeds: [StatsEmbed.build(message.client)] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
