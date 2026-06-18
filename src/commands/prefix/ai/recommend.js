const AIService = require("../../../services/AIService");
const AIEmbed = require("../../../ui/embeds/AIEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");
const LoadingEmbed = require("../../../ui/embeds/LoadingEmbed");

module.exports = {
  name: "recommend",
  async execute(message, args) {
    const taste = args.join(" ");
    if (!taste) return message.channel.send({ embeds: [ErrorEmbed.build("Please describe your music taste.")] });

    const msg = await message.channel.send({ embeds: [LoadingEmbed.build("Getting recommendations...")] });

    try {
      const recs = await AIService.recommend(taste);
      await msg.edit({ content: null, embeds: [AIEmbed.build(`Recommendations for: ${taste}`, recs)] });
    } catch (err) {
      await msg.edit({ content: null, embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
