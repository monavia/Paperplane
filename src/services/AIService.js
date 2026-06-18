const AIEngine = require("../core/ai/AIEngine");
const AIRecommendationEngine = require("../core/ai/RecommendationEngine");

async function ask(userId, prompt) {
  return AIEngine.ask(userId, prompt);
}

async function summarize(text) {
  return AIRecommendationEngine.summarizeText(text);
}

async function imagine(idea) {
  const dallePrompt = await AIRecommendationEngine.generateImagePrompt(idea);
  return dallePrompt;
}

async function recommend(taste, count) {
  return AIRecommendationEngine.recommendMusic(taste, count);
}

module.exports = { ask, summarize, imagine, recommend };
