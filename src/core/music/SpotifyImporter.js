class SpotifyImporter {
  constructor(guildId) {
    this.guildId = guildId;
  }

  async importPlaylist(url) {
    return { tracks: [], name: "Spotify Playlist" };
  }

  async importAlbum(url) {
    return { tracks: [], name: "Spotify Album" };
  }

  async importTrack(url) {
    return null;
  }
}

module.exports = SpotifyImporter;

//======================
// Created by monavia
// Don't change if you don't know
//======================
