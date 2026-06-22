const { getPlayer } = require("../../../core/music/PlayerManager");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "loop",
  async execute(message, args) {
    const mode = args[0]?.toLowerCase();
    if (!mode || !["none", "track", "queue"].includes(mode)) {
      return message.channel.send({ embeds: [ErrorEmbed.build("Usage: `!loop <none|track|queue>`")] });
    }

    const player = getPlayer(message.guildId);
    if (!player) return message.channel.send({ embeds: [ErrorEmbed.build("No active player.")] });

    await player.setRepeatMode(mode);
    await message.channel.send({ embeds: [SuccessEmbed.build(`Loop mode set to \`${mode}\`.`)] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
