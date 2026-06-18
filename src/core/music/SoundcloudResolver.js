const Resolver = require("./Resolver");

class SoundcloudResolver extends Resolver {
  async search(query, user) {
    const result = await super.search(query, user);
    return result;
  }

  isSoundcloudUrl(url) {
    return /soundcloud\.com/i.test(url);
  }
}

module.exports = SoundcloudResolver;
