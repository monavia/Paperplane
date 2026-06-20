const RecommendationEngine = require("./RecommendationEngine");
const Logger = require("../utils/Logger");

class AutoplayEngine {
  constructor() {
    this.recEngine = new RecommendationEngine();
  }

  async getNextTrack(player, currentTrack) {
    if (!currentTrack?.info) return null;

    try {
      const recs = await this.recEngine.getRecommendations(player, currentTrack, 3);
      if (!recs.length) {
        Logger.debug(`[AUTOPLAY] no recommendations for "${currentTrack.info.title}"`);
        return null;
      }
      Logger.debug(`[AUTOPLAY] found ${recs.length} candidate(s) for "${currentTrack.info.title}", picking first`);
      return recs[0];
    } catch (err) {
      Logger.error(`[AUTOPLAY] error for guild: ${err.message}`);
      return null;
    }
  }
}

module.exports = AutoplayEngine;

//======================
// Created by monavia
// Don't change if you don't know
//======================
