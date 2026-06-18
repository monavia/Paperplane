const MusicService = require("../../../services/MusicService");
const SuccessEmbed = require("../../../ui/embeds/SuccessEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "autoplay",
  async execute(message, args) {
    const engine = MusicService.getEngine(message.guildId);
    if (!engine) return message.channel.send({ embeds: [ErrorEmbed.build("No active player.")] });

    engine.playback.autoplay = !engine.playback.autoplay;
    const status = engine.playback.autoplay ? "enabled" : "disabled";
    await message.channel.send({ embeds: [SuccessEmbed.build(`Autoplay ${status}.`)] });
  },
};
