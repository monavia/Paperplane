const AIService = require("../../../services/AIService");
const AIEmbed = require("../../../ui/embeds/AIEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");
const LoadingEmbed = require("../../../ui/embeds/LoadingEmbed");

module.exports = {
  name: "summarize",
  async execute(message, args) {
    const text = args.join(" ");
    if (!text) return message.channel.send({ embeds: [ErrorEmbed.build("Please provide text to summarize.")] });

    const msg = await message.channel.send({ embeds: [LoadingEmbed.build("Summarizing...")] });

    try {
      const summary = await AIService.summarize(text);
      await msg.edit({ content: null, embeds: [AIEmbed.build("Summary", summary)] });
    } catch (err) {
      await msg.edit({ content: null, embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
