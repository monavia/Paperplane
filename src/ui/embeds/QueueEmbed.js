const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Colors = require("../../core/constants/Colors");
const { formatTrack } = require("../../core/utils/Formatter");

function build(tracks, page = 1) {
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(tracks.length / perPage));
  const start = (page - 1) * perPage;
  const slice = tracks.slice(start, start + perPage);

  const desc = slice.length
    ? slice.map((t, i) => formatTrack(t, start + i + 1)).join("\n")
    : "The queue is empty.";

  const embed = new EmbedBuilder()
    .setTitle(`Music Queue`)
    .setDescription(desc)
    .setColor(Colors.PRIMARY)
    .setFooter({ text: `Page ${page}/${totalPages} • ${tracks.length} tracks • ${tracks.length * 4} min total` });

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

  return { embed, row, totalPages };
}

function getPage(customId, page, totalPages) {
  if (customId === "queue_first") return 1;
  if (customId === "queue_prev") return Math.max(1, page - 1);
  if (customId === "queue_next") return Math.min(totalPages, page + 1);
  if (customId === "queue_last") return totalPages;
  return page;
}

async function send(target, tracks, userId) {
  const totalPages = Math.max(1, Math.ceil(tracks.length / 10));
  let page = 1;

  const sendPayload = (page) => {
    const { embed, row } = build(tracks, page);
    return { embeds: [embed], components: [row] };
  };

  let msg;
  if (target.reply) {
    msg = await target.reply({ ...sendPayload(page), fetchReply: true });
  } else {
    msg = await target.send({ ...sendPayload(page) });
  }

  if (totalPages <= 1) return;

  const collector = msg.createMessageComponentCollector({
    filter: (i) => i.customId.startsWith("queue_") && i.user.id === userId,
    time: 300000,
  });

  collector.on("collect", async (i) => {
    page = getPage(i.customId, page, totalPages);
    const { embed, row } = build(tracks, page);
    await i.update({ embeds: [embed], components: [row] });
  });

  collector.on("end", async () => {
    const { embed } = build(tracks, page);
    await msg.edit({ embeds: [embed], components: [] }).catch(() => {});
  });
}

module.exports = { build, send };
