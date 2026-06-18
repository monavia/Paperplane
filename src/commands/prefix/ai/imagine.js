const AIService = require("../../../services/AIService");
const AIEmbed = require("../../../ui/embeds/AIEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");
const LoadingEmbed = require("../../../ui/embeds/LoadingEmbed");

module.exports = {
  name: "imagine",
  async execute(message, args) {
    const idea = args.join(" ");
    if (!idea) return message.channel.send({ embeds: [ErrorEmbed.build("Please describe what to generate.")] });

    const msg = await message.channel.send({ embeds: [LoadingEmbed.build("Generating prompt...")] });

    try {
      const dallePrompt = await AIService.imagine(idea);
      await msg.edit({ content: null, embeds: [AIEmbed.build(`Imagine: ${idea}`, dallePrompt)] });
    } catch (err) {
      await msg.edit({ content: null, embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
