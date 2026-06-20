const express = require("express");
const session = require("express-session");
const path = require("path");
const auth = require("./auth");
const api = require("./api");
const Logger = require("../core/utils/Logger");

const PORT = Number(process.env.DASHBOARD_PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "paperplane-dashboard-secret";

function start(client) {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, "public")));

  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  }));

  app.get("/auth/login", (req, res) => {
    res.redirect(auth.getAuthUrl());
  });

  app.get("/auth/callback", async (req, res) => {
    const { code, error } = req.query;
    if (error) return res.redirect("/?error=unauthorized");
    if (!code) return res.redirect("/?error=no_code");

    try {
      const tokens = await auth.exchangeCode(code);
      req.session.accessToken = tokens.access_token;
      req.session.refreshToken = tokens.refresh_token;
      res.redirect("/");
    } catch (err) {
      Logger.error("OAuth2 callback error:", err.message);
      res.redirect("/?error=auth_failed");
    }
  });

  app.get("/auth/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
  });

  app.get("/api/me", async (req, res) => {
    if (!req.session.accessToken) return res.json({ user: null });
    try {
      const user = await auth.getUser(req.session.accessToken);
      res.json({ user });
    } catch {
      try {
        const tokens = await auth.refreshToken(req.session.refreshToken);
        req.session.accessToken = tokens.access_token;
        req.session.refreshToken = tokens.refresh_token;
        const user = await auth.getUser(tokens.access_token);
        res.json({ user });
      } catch {
        req.session.destroy();
        res.json({ user: null });
      }
    }
  });

  app.get("/api/guilds", async (req, res) => {
    if (!req.session.accessToken) return res.status(401).json({ error: "Not authenticated" });

    try {
      const [userGuilds, botGuilds] = await Promise.all([
        auth.getUserGuilds(req.session.accessToken),
        Promise.resolve(client.guilds.cache),
      ]);

      const botGuildIds = new Set(botGuilds.keys());
      const manageable = userGuilds
        .filter((g) => botGuildIds.has(g.id) && (Number(g.permissions) & 0x20) === 0x20)
        .map((g) => ({ id: g.id, name: g.name, icon: g.icon }));

      res.json(manageable);
    } catch {
      res.status(500).json({ error: "Failed to fetch guilds" });
    }
  });

  app.use("/api/player", api(client));

  app.listen(PORT, () => {
    Logger.info(`Dashboard running at http://localhost:${PORT}`);
  });
}

module.exports = { start };

//======================
// Created by monavia
// Don't change if you don't know
//======================
