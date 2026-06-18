class PromptBuilder {
  static build(userId, prompt, systemOverride, memory) {
    const system = systemOverride || "You are a helpful Discord assistant. Answer concisely and clearly.";
    const history = memory?.getHistory(userId) || [];

    const messages = [{ role: "system", content: system }];
    for (const msg of history.slice(-10)) {
      messages.push({ role: "user", content: msg.user });
      if (msg.assistant) messages.push({ role: "assistant", content: msg.assistant });
    }
    messages.push({ role: "user", content: prompt });
    return messages;
  }
}

module.exports = PromptBuilder;
