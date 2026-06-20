const mongoose = require("mongoose");

const trackPlaySchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  trackTitle: { type: String, required: true },
  trackAuthor: { type: String, default: "" },
  source: { type: String, default: "unknown" },
  duration: { type: Number, default: 0 },
  playedMs: { type: Number, default: 0 },
  userId: { type: String, default: null },
  username: { type: String, default: null },
  playedAt: { type: Date, default: Date.now },
});

trackPlaySchema.index({ playedAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.model("TrackPlay", trackPlaySchema);

//======================
// Created by monavia
// Don't change if you don't know
//======================
