function buildReply(ctx) {
  const api = {
    async reply(content) {
      const opts = typeof content === "string" ? { content } : content;
      if (ctx.isSlash || ctx.isComponent) {
        if (ctx.deferred) return ctx.interaction.editReply(opts);
        ctx.replied = true;
        return ctx.interaction.reply(opts);
      }
      ctx.replied = true;
      return ctx.channel.send(opts);
    },
    async defer() {
      if (ctx.isSlash) {
        ctx.deferred = true;
        return ctx.interaction.deferReply();
      }
    },
    async edit(content) {
      const opts = typeof content === "string" ? { content } : content;
      if (ctx.isSlash || ctx.isComponent) return ctx.interaction.editReply(opts);
      return ctx.message?.edit?.(opts);
    },
    async followUp(content) {
      const opts = typeof content === "string" ? { content } : content;
      if (ctx.isSlash || ctx.isComponent) return ctx.interaction.followUp(opts);
      return ctx.channel.send(opts);
    },
    async send(content) {
      const opts = typeof content === "string" ? { content } : content;
      return ctx.channel.send(opts);
    },
  };
  return api;
}

module.exports = buildReply;
