const { EmbedBuilder } = require("discord.js");
const Colors = require("../../../core/constants/Colors");

module.exports = {
  name: "help",
  async execute(message, args) {
    const embed = new EmbedBuilder()
      .setTitle("Help")
      .setDescription("Available commands:")
      .addFields(
        { name: "🎵 Music", value: "`!play`, `!skip`, `!stop`, `!pause`, `!resume`, `!queue`, `!np`, `!volume`, `!shuffle`, `!loop`, `!seek`, `!autoplay`" },
        { name: "🤖 AI", value: "`!ask`, `!summarize`, `!imagine`, `!recommend`" },
        { name: "⚙️ System", value: "`!ping`, `!help`, `!info`, `!stats`, `!prefix`" },
      )
      .setColor(Colors.PRIMARY);

    await message.channel.send({ embeds: [embed] });
  },
};
