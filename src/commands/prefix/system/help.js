const { EmbedBuilder } = require("discord.js");
const Colors = require("../../../core/constants/Colors");

module.exports = {
  name: "help",
  async execute(message, args) {
    const embed = new EmbedBuilder()
      .setTitle("Help")
      .setDescription("Daftar perintah yang tersedia:")
      .addFields(
        {
          name: "🎵 Music",
          value:
            "`!play <judul/url>` — Memutar lagu\n" +
            "`!skip` — Melewati lagu\n" +
            "`!stop` — Berhenti & disconnect\n" +
            "`!pause` — Jeda lagu\n" +
            "`!resume` — Lanjutkan lagu\n" +
            "`!queue` — Lihat antrian\n" +
            "`!np` — Lagu yang sedang diputar\n" +
            "`!volume <1-100>` — Atur volume\n" +
            "`!shuffle` — Acak antrian\n" +
            "`!loop` — Ulang lagu/antrian\n" +
            "`!seek <detik>` — Loncat ke posisi\n" +
            "`!autoplay` — Putar lagu serupa",
        },
        {
          name: "🤖 AI",
          value:
            "`!recommend` — Rekomendasi lagu",
        },
        {
          name: "⚙️ System",
          value:
            "`!ping` — Cek respon bot\n" +
            "`!help` — Bantuan ini\n" +
            "`!info` — Info bot\n" +
            "`!stats` — Statistik bot\n" +
            "`!prefix` — Ganti prefix",
        },
      )
      .setColor(Colors.PRIMARY);

    await message.channel.send({ embeds: [embed] });
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
