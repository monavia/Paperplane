const { EmbedBuilder } = require("discord.js");
const Colors = require("../../../core/constants/Colors");
const GuildRepository = require("../../../database/repositories/GuildRepository");
const botConfig = require("../../../config/bot");

module.exports = {
  name: "help",
  async execute(message, args) {
    const prefix = (await GuildRepository.getPrefix(message.guildId)) || botConfig.prefix;
    const embed = new EmbedBuilder()
      .setTitle("Help")
      .setDescription("Daftar perintah yang tersedia:")
      .addFields(
        {
          name: "🎵 Music",
          value:
            `\`${prefix}play <judul/url>\` — Memutar lagu\n` +
            `\`${prefix}skip\` — Melewati lagu\n` +
            `\`${prefix}stop\` — Berhenti & disconnect\n` +
            `\`${prefix}pause\` — Jeda lagu\n` +
            `\`${prefix}resume\` — Lanjutkan lagu\n` +
            `\`${prefix}queue\` — Lihat antrian\n` +
            `\`${prefix}np\` — Now playing\n` +
            `\`${prefix}volume <1-100>\` — Atur volume\n` +
            `\`${prefix}shuffle\` — Acak antrian\n` +
            `\`${prefix}loop\` — Ulang lagu/antrian\n` +
            `\`${prefix}seek <detik>\` — Loncat ke posisi\n` +
            `\`${prefix}autoplay\` — Putar lagu serupa`,
        },
        {
          name: "🤖 AI",
          value:
            `\`${prefix}recommend\` — Rekomendasi lagu`,
        },
        {
          name: "⚙️ System",
          value:
            `\`${prefix}ping\` — Cek respon bot\n` +
            `\`${prefix}help\` — Bantuan ini\n` +
            `\`${prefix}info\` — Info bot\n` +
            `\`${prefix}stats\` — Statistik bot\n` +
            `\`${prefix}prefix\` — Ganti prefix`,
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
