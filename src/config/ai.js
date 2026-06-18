require("dotenv/config");

module.exports = {
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
  model: process.env.OLLAMA_MODEL || "llama3",
  temperature: Number(process.env.AI_TEMPERATURE) || 0.7,
  maxTokens: Number(process.env.AI_MAX_TOKENS) || 2048,
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
