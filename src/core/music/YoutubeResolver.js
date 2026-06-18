const Resolver = require("./Resolver");

class YoutubeResolver extends Resolver {
  async search(query, user) {
    const result = await super.search(query, user);
    return result;
  }

  isYoutubeUrl(url) {
    return /(youtube\.com|youtu\.be)/i.test(url);
  }
}

module.exports = YoutubeResolver;
