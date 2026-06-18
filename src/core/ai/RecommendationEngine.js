const AIEngine = require("./AIEngine");

class AIRecommendationEngine {
  async recommendMusic(taste, count = 5) {
    const prompt = `Recommend ${count} songs based on this taste: "${taste}". Return only a numbered list with artist and track name.`;
    return AIEngine.ask("recommendation-system", prompt);
  }

  async summarizeText(text) {
    const prompt = `Summarize the following text concisely:\n\n${text}`;
    return AIEngine.ask("summarize-system", prompt);
  }

  async generateImagePrompt(idea) {
    const prompt = `Create a detailed image generation prompt for: "${idea}"`;
    return AIEngine.ask("imagine-system", prompt);
  }
}

module.exports = new AIRecommendationEngine();
