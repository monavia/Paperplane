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

//======================
// Created by monavia
// Don't change if you don't know
//======================
