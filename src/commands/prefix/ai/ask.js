const AIService = require("../../../services/AIService");
const AIEmbed = require("../../../ui/embeds/AIEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");
const LoadingEmbed = require("../../../ui/embeds/LoadingEmbed");

module.exports = {
  name: "ask",
  async execute(message, args) {
    const prompt = args.join(" ");
    if (!prompt) return message.channel.send({ embeds: [ErrorEmbed.build("Please provide a question.")] });

    const msg = await message.channel.send({ embeds: [LoadingEmbed.build("Thinking...")] });

    try {
      const answer = await AIService.ask(message.author.id, prompt);
      await msg.edit({ content: null, embeds: [AIEmbed.build(prompt, answer)] });
    } catch (err) {
      await msg.edit({ content: null, embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
