const Resolver = require("./Resolver");

class SpotifyResolver extends Resolver {
  async search(query, user) {
    const result = await super.search(query, user);
    return result;
  }

  isSpotifyUrl(url) {
    return /open\.spotify\.com/i.test(url);
  }
}

module.exports = SpotifyResolver;

//======================
// Created by monavia
// Don't change if you don't know
//======================
