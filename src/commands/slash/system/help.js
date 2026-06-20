const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Colors = require("../../../core/constants/Colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show available commands"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Help")
      .setDescription("Daftar perintah yang tersedia:")
      .addFields(
        {
          name: "🎵 Music",
          value:
            "`/play <judul/url>` — Memutar lagu\n" +
            "`/skip` — Melewati lagu\n" +
            "`/stop` — Berhenti & disconnect\n" +
            "`/pause` — Jeda lagu\n" +
            "`/resume` — Lanjutkan lagu\n" +
            "`/queue` — Lihat antrian\n" +
            "`/nowplaying` — Now playing\n" +
            "`/volume <1-100>` — Atur volume\n" +
            "`/shuffle` — Acak antrian\n" +
            "`/loop` — Ulang lagu/antrian\n" +
            "`/seek <detik>` — Loncat ke posisi\n" +
            "`/autoplay` — Putar lagu serupa",
        },
        {
          name: "🤖 AI",
          value:
            "`/recommend` — Rekomendasi lagu",
        },
        {
          name: "⚙️ System",
          value:
            "`/ping` — Cek respon bot\n" +
            "`/help` — Bantuan ini\n" +
            "`/info` — Info bot\n" +
            "`/stats` — Statistik bot\n" +
            "`/tiktok channel #channel` — Set channel notifikasi\n" +
            "`/tiktok add <user>` — Pantau TikTok\n" +
            "`/tiktok remove <user>` — Hentikan pantauan\n" +
            "`/tiktok list` — Lihat daftar pantauan\n" +
            "`/prefix` — Ganti prefix",
        },
      )
      .setColor(Colors.PRIMARY);

    await interaction.reply({ embeds: [embed] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
