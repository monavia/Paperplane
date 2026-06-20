const mongoose = require("mongoose");

const commandUsageSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  commandName: { type: String, required: true },
  userId: { type: String, default: null },
  usedAt: { type: Date, default: Date.now },
});

commandUsageSchema.index({ usedAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.model("CommandUsage", commandUsageSchema);

//======================
// Created by monavia
// Don't change if you don't know
//======================
