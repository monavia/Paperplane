async function runMiddleware(ctx, middlewares, handler) {
  let idx = 0;
  async function next() {
    if (idx < middlewares.length) {
      const fn = middlewares[idx++];
      return fn(ctx, next);
    }
    return handler(ctx);
  }
  return next();
}

module.exports = { runMiddleware };

//======================
// Created by monavia
// Don't change if you don't know
//======================
