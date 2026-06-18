const AIService = require("../../../services/AIService");
const AIEmbed = require("../../../ui/embeds/AIEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "ask",
  async execute(message, args) {
    const prompt = args.join(" ");
    if (!prompt) return message.channel.send({ embeds: [ErrorEmbed.build("Please provide a question.")] });

    const msg = await message.channel.send("Thinking...");

    try {
      const answer = await AIService.ask(message.author.id, prompt);
      await msg.edit({ content: null, embeds: [AIEmbed.build(prompt, answer)] });
    } catch (err) {
      await msg.edit({ content: null, embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};
