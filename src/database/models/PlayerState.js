const { Schema, model } = require("mongoose");

const playerStateSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  voiceChannelId: { type: String, required: true },
  textChannelId: { type: String, default: null },
  queue: { type: [Schema.Types.Mixed], default: [] },
  nowPlaying: { type: Schema.Types.Mixed, default: null },
  updatedAt: { type: Date, default: Date.now, index: { expires: 86400 } },
});

module.exports = model("PlayerState", playerStateSchema);

//======================
// Created by monavia
// Don't change if you don't know
//======================
