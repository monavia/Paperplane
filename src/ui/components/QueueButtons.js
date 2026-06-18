const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function build(page, totalPages) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("queue_first")
      .setEmoji("⏪")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId("queue_prev")
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId("queue_next")
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages),
    new ButtonBuilder()
      .setCustomId("queue_last")
      .setEmoji("⏩")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages),
  );
  return row;
}

module.exports = { build };

//======================
// Created by monavia
// Don't change if you don't know
//======================
