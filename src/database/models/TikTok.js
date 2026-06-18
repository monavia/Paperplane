const { Schema, model } = require("mongoose");

const tikTokSchema = new Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  username: { type: String, required: true },
  isLive: { type: Boolean, default: false },
  lastChecked: { type: Date, default: null },
});

tikTokSchema.index({ guildId: 1, username: 1 }, { unique: true });

module.exports = model("TikTok", tikTokSchema);
