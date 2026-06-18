const Logger = require("../utils/Logger");

class SpotifyScraper {
  constructor() {
    this.headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    };
  }

  parseUrl(url) {
    const m = url.match(/open\.spotify\.com\/(playlist|track|album)\/([a-zA-Z0-9]+)/);
    if (!m) return null;
    return { type: m[1], id: m[2] };
  }

  async scrape(url) {
    const parsed = this.parseUrl(url);
    if (!parsed) return null;
    if (parsed.type === "playlist") return this.scrapePlaylist(parsed.id);
    if (parsed.type === "track") return this.scrapeTrack(parsed.id);
    if (parsed.type === "album") return this.scrapeAlbum(parsed.id);
    return null;
  }

  async scrapePlaylist(id) {
    const html = await this._fetchPage(`https://open.spotify.com/playlist/${id}`);
    return this._extractTracks(html, id);
  }

  async scrapeTrack(id) {
    const html = await this._fetchPage(`https://open.spotify.com/track/${id}`);
    const tracks = this._extractTracks(html, id);
    return tracks.slice(0, 1);
  }

  async scrapeAlbum(id) {
    const html = await this._fetchPage(`https://open.spotify.com/album/${id}`);
    return this._extractTracks(html, id);
  }

  async _fetchPage(url) {
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) throw new Error(`Spotify returned HTTP ${res.status}`);
    return res.text();
  }

  _extractTracks(html, id) {
    // Try 1: base64 session data in <script type="text/json">
    const sessionMatch = html.match(/<script[^>]*type="text\/json"[^>]*>([A-Za-z0-9+/=]+)<\/script>/);
    if (sessionMatch) {
      try {
        const decoded = Buffer.from(sessionMatch[1], "base64").toString("utf-8");
        const data = JSON.parse(decoded);
        const items = this._findItems(data);
        if (items?.length) return this._mapTracks(items);
      } catch {}
    }

    // Try 2: plain JSON in any <script> tag
    const scriptRegex = /<script[^>]*>([A-Za-z0-9+/=]{100,})<\/script>/g;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
      try {
        const decoded = Buffer.from(match[1], "base64").toString("utf-8").replace(/\0/g, "");
        const data = JSON.parse(decoded);
        const items = this._findItems(data);
        if (items?.length) return this._mapTracks(items);
      } catch {}
    }

    // Try 3: __NEXT_DATA__
    const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*type="application\/json"[^>]*>({.+?})<\/script>/s);
    if (nextMatch) {
      try {
        const data = JSON.parse(nextMatch[1]);
        const items = this._findItems(data);
        if (items?.length) return this._mapTracks(items);
      } catch {}
    }

    throw new Error("Could not extract track data from Spotify page — Spotify may have changed their page structure");
  }

  _findItems(obj) {
    if (!obj || typeof obj !== "object") return null;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const found = this._findItems(item);
        if (found) return found;
      }
      return null;
    }

    // direct track list
    if (obj.items && Array.isArray(obj.items)) {
      if (obj.items[0]?.track?.name || obj.items[0]?.itemV2?.data?.name) return obj.items;
      if (obj.items[0]?.name) return obj.items;
    }

    // nested paths
    if (obj.playlistV2?.content?.items) return obj.playlistV2.content.items;
    if (obj.playlist?.tracks?.items) return obj.playlist.tracks.items;
    if (obj.album?.tracks?.items) return obj.album.tracks.items;
    if (obj.tracks?.items) return obj.tracks.items;
    if (obj.tracks && Array.isArray(obj.tracks)) return obj.tracks;

    for (const key of Object.keys(obj)) {
      const found = this._findItems(obj[key]);
      if (found) return found;
    }
    return null;
  }

  _mapTracks(items) {
    return items.map((item) => {
      let track;

      // itemV2 structure (current Spotify web player)
      if (item.itemV2?.data) {
        track = item.itemV2.data;
      } else if (item.track) {
        track = item.track;
      } else {
        track = item;
      }

      const name = track.name || track.title || "";
      const artistArr = [];

      if (track.artists?.items) {
        for (const a of track.artists.items) {
          if (a.profile?.name) artistArr.push(a.profile.name);
          else if (a.name) artistArr.push(a.name);
        }
      } else if (track.artists && Array.isArray(track.artists)) {
        for (const a of track.artists) {
          if (typeof a === "string") artistArr.push(a);
          else if (a.name) artistArr.push(a.name);
        }
      } else if (track.subtitle) {
        artistArr.push(track.subtitle);
      }

      return { name, artists: artistArr, query: `${artistArr.join(" ")} ${name}`.trim() };
    }).filter((t) => t.name);
  }
}

module.exports = new SpotifyScraper();

//======================
// Created by monavia
// Don't change if you don't know
//======================
