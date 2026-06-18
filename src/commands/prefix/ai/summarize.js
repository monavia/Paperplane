const AIService = require("../../../services/AIService");
const AIEmbed = require("../../../ui/embeds/AIEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "summarize",
  async execute(message, args) {
    const text = args.join(" ");
    if (!text) return message.channel.send({ embeds: [ErrorEmbed.build("Please provide text to summarize.")] });

    const msg = await message.channel.send("Summarizing...");

    try {
      const summary = await AIService.summarize(text);
      await msg.edit({ content: null, embeds: [AIEmbed.build("Summary", summary)] });
    } catch (err) {
      await msg.edit({ content: null, embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};
