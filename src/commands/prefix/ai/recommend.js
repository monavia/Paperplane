const AIService = require("../../../services/AIService");
const AIEmbed = require("../../../ui/embeds/AIEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "recommend",
  async execute(message, args) {
    const taste = args.join(" ");
    if (!taste) return message.channel.send({ embeds: [ErrorEmbed.build("Please describe your music taste.")] });

    const msg = await message.channel.send("Getting recommendations...");

    try {
      const recs = await AIService.recommend(taste);
      await msg.edit({ content: null, embeds: [AIEmbed.build(`Recommendations for: ${taste}`, recs)] });
    } catch (err) {
      await msg.edit({ content: null, embeds: [ErrorEmbed.build(err.message)] });
    }
  },
};
