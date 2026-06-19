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
    // Try main page first — usually has full track list
    const html = await this._fetchPage(`https://open.spotify.com/playlist/${id}`);
    const tracks = this._extractFromHtml(html);
    if (tracks?.length >= 10) return this._deduplicate(tracks);

    // Fall back to embed page with pagination
    const allTracks = [];
    let offset = 0;
    while (allTracks.length < 500) {
      const data = await this._fetchEntity("playlist", id, offset);
      if (!data?.entity?.trackList?.length) break;
      const mapped = data.entity.trackList.map((t) => ({
        name: t.title,
        artists: t.subtitle ? [t.subtitle] : [],
        query: `${t.subtitle || ""} ${t.title}`.trim(),
      }));
      allTracks.push(...mapped);
      if (mapped.length < 50) break;
      offset += 50;
    }
    if (allTracks.length) return this._deduplicate(allTracks);

    throw new Error("Could not extract playlist data from Spotify");
  }

  async scrapeTrack(id) {
    const data = await this._fetchEntity("track", id);
    if (!data?.entity) {
      throw new Error("Could not extract track data from Spotify");
    }
    const e = data.entity;
    const artistNames = (e.artists || []).map((a) => a.name).filter(Boolean);
    return [
      {
        name: e.title || e.name || "",
        artists: artistNames,
        query: `${artistNames.join(" ")} ${e.title || e.name || ""}`.trim(),
      },
    ];
  }

  async scrapeAlbum(id) {
    // Album embed returns 404 — try the main page
    const html = await this._fetchPage(`https://open.spotify.com/album/${id}`);
    const tracks = this._extractFromHtml(html);
    if (tracks?.length) return tracks;
    throw new Error("Could not extract track data from Spotify album — albums are not supported without API access");
  }

  async _fetchEntity(type, id, offset = 0) {
    const url = `https://open.spotify.com/embed/${type}/${id}${offset ? `?offset=${offset}` : ""}`;
    const html = await this._fetchPage(url);
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (!match) return null;
    const json = JSON.parse(match[1]);
    return json.props?.pageProps?.state?.data || null;
  }

  async _fetchPage(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(url, { headers: this.headers, signal: controller.signal });
      if (!res.ok) throw new Error(`Spotify returned HTTP ${res.status}`);
      return await res.text();
    } finally {
      clearTimeout(timer);
    }
  }

  _extractFromHtml(html) {
    // Try __NEXT_DATA__ first
    const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/);
    if (nextMatch) {
      try {
        const data = JSON.parse(nextMatch[1]);
        const candidates = this._findAllItems(data);
        if (candidates.length) {
          const best = candidates.reduce((a, b) => a.length >= b.length ? a : b);
          if (best?.length) return this._mapTracks(best);
        }
      } catch {}
    }

    // Try base64 session data in <script type="text/json">
    const sessionMatch = html.match(/<script[^>]*type="text\/json"[^>]*>([A-Za-z0-9+/=]+)<\/script>/);
    if (sessionMatch) {
      try {
        const decoded = Buffer.from(sessionMatch[1], "base64").toString("utf-8");
        const data = JSON.parse(decoded);
        const candidates = this._findAllItems(data);
        if (candidates.length) {
          const best = candidates.reduce((a, b) => a.length >= b.length ? a : b);
          if (best?.length) return this._mapTracks(best);
        }
      } catch {}
    }

    return null;
  }

  _findAllItems(obj, results = []) {
    if (!obj || typeof obj !== "object") return results;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        this._findAllItems(item, results);
      }
      return results;
    }

    if (obj.items && Array.isArray(obj.items)) {
      if (obj.items[0]?.track?.name || obj.items[0]?.name || obj.items[0]?.title) results.push(obj.items);
    }

    if (obj.trackList && Array.isArray(obj.trackList)) results.push(obj.trackList);
    if (obj.playlistV2?.content?.items) results.push(obj.playlistV2.content.items);
    if (obj.data?.playlistV2?.content?.items) results.push(obj.data.playlistV2.content.items);
    if (obj.playlist?.tracks?.items) results.push(obj.playlist.tracks.items);
    if (obj.album?.tracks?.items) results.push(obj.album.tracks.items);
    if (obj.tracks?.items) results.push(obj.tracks.items);
    if (obj.tracks && Array.isArray(obj.tracks)) results.push(obj.tracks);

    for (const key of Object.keys(obj)) {
      this._findAllItems(obj[key], results);
    }
    return results;
  }

  _deduplicate(tracks) {
    const seen = new Set();
    return tracks.filter((t) => {
      const key = t.query.toLowerCase().replace(/\s+/g, " ");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  _mapTracks(items) {
    return items.map((item) => {
      let track;

      if (item.title && item.subtitle) {
        return {
          name: item.title,
          artists: item.subtitle ? [item.subtitle] : [],
          query: `${item.subtitle || ""} ${item.title}`.trim(),
        };
      }

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
