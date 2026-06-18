const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: "!" },
  volume: { type: Number, default: 80 },
  djRole: { type: String, default: null },
  announceTracks: { type: Boolean, default: true },
  aiChannel: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

guildSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Guild", guildSchema);

//======================
// Created by monavia
// Don't change if you don't know
//======================
