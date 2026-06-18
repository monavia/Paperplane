const { getPlayer } = require("../../../core/music/PlayerManager");
const { parseTimestamp, parseDuration } = require("../../../core/utils/Duration");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "seek",
  async execute(message, args) {
    const posStr = args.join(" ");
    if (!posStr) return message.channel.send({ embeds: [ErrorEmbed.build("Usage: `!seek <mm:ss or ss>`")] });

    const player = getPlayer(message.guildId);
    if (!player || !player.queue.current) return message.channel.send({ embeds: [ErrorEmbed.build("Nothing is playing.")] });

    const ms = parseTimestamp(posStr);
    if (isNaN(ms)) return message.channel.send({ embeds: [ErrorEmbed.build("Invalid time format. Use mm:ss or ss.")] });

    if (ms > player.queue.current.info.duration) {
      return message.channel.send({ embeds: [ErrorEmbed.build("Position exceeds track duration.")] });
    }

    player.seek(ms);
    await message.channel.send({ embeds: [SuccessEmbed.build(`Seeked to ${parseDuration(ms)}.`)] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
