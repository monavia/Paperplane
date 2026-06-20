class RecommendationEngine {
  _buildQuery(info) {
    const author = (info.author || "").replace(/^Various\s*$/i, "").trim();
    const title = (info.title || "").trim();
    if (author && author !== "Unknown Artist" && author !== "Unknown") {
      return `${author} - ${title}`;
    }
    return title;
  }

  _isSameTrack(a, b) {
    if (!a?.info || !b?.info) return false;
    const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return norm(a.info.title) === norm(b.info.title) && norm(a.info.author) === norm(b.info.author);
  }

  async getRecommendations(player, track, count = 5) {
    if (!track?.info) return [];

    const query = this._buildQuery(track.info);
    if (!query) return [];

    try {
      const result = await player.search({ query: `ytsearch:${query}` });
      if (!result?.tracks?.length) return [];

      const filtered = result.tracks.filter((t) => !this._isSameTrack(t, track));
      return filtered.slice(0, count);
    } catch {
      return [];
    }
  }
}

module.exports = RecommendationEngine;

//======================
// Created by monavia
// Don't change if you don't know
//======================
