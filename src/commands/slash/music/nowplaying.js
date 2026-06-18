const { SlashCommandBuilder } = require("discord.js");
const { getPlayer } = require("../../../core/music/PlayerManager");
const NowPlayingEmbed = require("../../../ui/embeds/NowPlayingEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show the currently playing track"),

  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    const track = player?.queue?.current;
    if (!track) return interaction.reply({ embeds: [ErrorEmbed.build("Nothing is playing.")], ephemeral: true });

    await interaction.reply({ embeds: [NowPlayingEmbed.build(track, player)] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
