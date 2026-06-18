const aiConfig = require("../../config/ai");
const PromptBuilder = require("./PromptBuilder");
const ConversationMemory = require("./ConversationMemory");
const Logger = require("../utils/Logger");

class AIEngine {
  constructor() {
    this.memory = new ConversationMemory();
  }

  isReady() {
    return true;
  }

  async ask(userId, prompt, systemPrompt) {
    const messages = PromptBuilder.build(userId, prompt, systemPrompt, this.memory);

    const response = await fetch(`${aiConfig.host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: aiConfig.model,
        messages,
        stream: false,
        options: {
          temperature: aiConfig.temperature,
          num_predict: aiConfig.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama error (${response.status}): ${text}`);
    }

    const data = await response.json();
    const answer = data.message?.content || "No response.";
    this.memory.add(userId, prompt, answer);
    return answer;
  }

  async stream(userId, prompt, onChunk) {
    const messages = PromptBuilder.build(userId, prompt, undefined, this.memory);

    const response = await fetch(`${aiConfig.host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: aiConfig.model,
        messages,
        stream: true,
        options: {
          temperature: aiConfig.temperature,
          num_predict: aiConfig.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama error (${response.status}): ${text}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n").filter(Boolean)) {
        try {
          const json = JSON.parse(line);
          const text = json.message?.content || "";
          full += text;
          if (onChunk) onChunk(text);
        } catch {}
      }
    }

    this.memory.add(userId, prompt, full);
    return full;
  }
}

module.exports = new AIEngine();
