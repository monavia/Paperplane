const axios = require("axios");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.DASHBOARD_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.DASHBOARD_URL || "http://localhost:3000"}/auth/callback`;
const SCOPES = ["identify", "guilds"];

function getAuthUrl() {
  const url = new URL("https://discord.com/api/oauth2/authorize");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.join(" "));
  return url.toString();
}

async function exchangeCode(code) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  });

  const { data } = await axios.post("https://discord.com/api/oauth2/token", params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

async function refreshToken(refreshToken) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const { data } = await axios.post("https://discord.com/api/oauth2/token", params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

async function getUser(accessToken) {
  const { data } = await axios.get("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

async function getUserGuilds(accessToken) {
  const { data } = await axios.get("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

module.exports = { getAuthUrl, exchangeCode, refreshToken, getUser, getUserGuilds };

//======================
// Created by monavia
// Don't change if you don't know
//======================
