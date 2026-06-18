const { SlashCommandBuilder } = require("discord.js");
const MusicService = require("../../../services/MusicService");
const QueueEmbed = require("../../../ui/embeds/QueueEmbed");
const ErrorEmbed = require("../../../ui/embeds/ErrorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current queue"),

  async execute(interaction) {
    const tracks = MusicService.getQueue(interaction.guildId);
    if (!tracks?.length) return interaction.reply({ embeds: [ErrorEmbed.build("Queue is empty.")], ephemeral: true });

    await QueueEmbed.send(interaction, tracks, interaction.user.id);
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
