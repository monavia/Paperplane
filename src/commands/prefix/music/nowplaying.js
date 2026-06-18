const { getPlayer } = require("../../../core/music/PlayerManager");
const NowPlayingEmbed = require("../../../ui/embeds/NowPlayingEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  name: "nowplaying",
  aliases: ["np"],
  async execute(message, args) {
    const player = getPlayer(message.guildId);
    const track = player?.queue?.current;
    if (!track) return message.channel.send({ embeds: [ErrorEmbed.build("Nothing is playing.")] });

    await message.channel.send({ embeds: [NowPlayingEmbed.build(track, player)] });
  },
};
