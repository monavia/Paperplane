<p align="center">
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=monavia&repo=paperplane&theme=tokyonight" alt="Repo Card" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white" />
  <img src="https://img.shields.io/badge/Lavalink-FF6B6B?style=for-the-badge&logo=discord&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge" />
</p>

<h1 align="center">🛩️ Paperplane</h1>
<p align="center"><b>Music • Dashboard • Analytics — High-Performance Discord Music Bot</b></p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎵 **Music** | High-quality audio via Lavalink with 4-node failover |
| 🎯 **Spotify Support** | Play tracks, playlists & albums via HTML scraping |
| 🌐 **Web Dashboard** | Full player control, queue management & server stats |
| 📊 **Analytics** | Track plays, top users, command usage with Chart.js visualizations |
| 🤖 **Autoplay** | Intelligent recommendations when queue ends |
| 🔄 **Multi-Node** | 4 Lavalink nodes with automatic cascading failover |
| 💾 **Persistent Settings** | Guild config saved via MongoDB |
| 🛡️ **Reliable** | Built with discord.js v14, battle-tested |

## 🚀 What Makes It Unique

- **4 Lavalink nodes** with automatic failover — music never stops
- **Spotify playback** without Premium API (custom HTML scraper)
- **Full web dashboard** with real-time player controls + statistics
- **Self-hosted** — full control over your infrastructure
- **Minimal resource usage** — designed for efficiency

## 💎 Add to Your Server

<p align="center">
  <a href="https://discord.com/oauth2/authorize?client_id=957823446564352080">
    <img src="https://img.shields.io/badge/Invite%20Paperplane-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Invite Paperplane" />
  </a>
</p>

<p align="center">
  <b><a href="https://discord.com/oauth2/authorize?client_id=957823446564352080">» Invite Paperplane to Your Server «</a></b>
</p>

### Required Permissions

| Permission | Purpose |
|---|---|
| `Send Messages` | Display responses and embeds |
| `Embed Links` | Send rich embeds |
| `Read Message History` | Read slash commands |
| `Connect` | Join voice channels |
| `Speak` | Play music |
| `Use Voice Activity` | Voice detection |

---

## Quick Start

```bash
git clone https://github.com/monavia/paperplane
cd paperplane
npm install
cp .env.example .env
# Edit .env with your bot token and settings
npm start
```

## Requirements

- [Node.js](https://nodejs.org/) v18+
- [Lavalink](https://github.com/lavalink-devs/Lavalink) server (music) — up to 4 nodes
- [MongoDB](https://www.mongodb.com/) (optional — guild settings & analytics)
- [Ollama](https://ollama.com/) (optional — AI features, currently blocked)

## Environment Variables

### Core
| Variable | Description | Default |
|---|---|---|
| `DISCORD_TOKEN` | Bot token | — |
| `CLIENT_ID` | Application ID | — |
| `PREFIX` | Prefix for text commands | `!` |

### Lavalink (up to 4 nodes)
| Variable | Description | Default |
|---|---|---|
| `LAVALINK_HOST` | Main node host | `localhost` |
| `LAVALINK_PORT` | Main node port | `2323` |
| `LAVALINK_PASSWORD` | Main node password | `youshallnotpass` |
| `LAVALINK_HOST_2` | Backup node host | — |
| `LAVALINK_PORT_2` | Backup node port | `2324` |
| `LAVALINK_HOST_3` | Node 3 host | — |
| `LAVALINK_PORT_3` | Node 3 port | `2325` |
| `LAVALINK_HOST_4` | Node 4 host | — |
| `LAVALINK_PORT_4` | Node 4 port | `2326` |

### Dashboard
| Variable | Description | Default |
|---|---|---|
| `DASHBOARD_ENABLED` | Enable web dashboard | `false` |
| `DASHBOARD_PORT` | Dashboard server port | `3000` |
| `DASHBOARD_CLIENT_SECRET` | Discord OAuth2 client secret | — |
| `SESSION_SECRET` | Session encryption secret | auto-generated |

### Optional
| Variable | Description | Default |
|---|---|---|
| `OLLAMA_HOST` | Ollama API URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model name | `llama3` |
| `DATABASE_URI` | MongoDB connection string | — |

## Commands

### Music
| Command | Description |
|---|---|
| `play / p <query\|url>` | Play a song or add to queue |
| `skip` | Skip current track |
| `stop` | Stop playback & clear queue |
| `pause` | Pause playback |
| `resume` | Resume playback |
| `queue` | Show upcoming tracks |
| `volume <1-100>` | Adjust volume |
| `autoplay` | Toggle auto-recommendations |
| `nowplaying / np` | Show current track info |

### System
| Command | Description |
|---|---|
| `prefix [new_prefix]` | View or change command prefix |
| `ping` | Check bot latency |
| `help` | Display help menu |
| `uptime` | Show bot uptime |
| `stats` | Display bot statistics |

## Project Structure

```
src/
├── commands/          # Slash & prefix commands
├── core/              # Core logic (music, AI, state, utils)
│   └── music/         # Lavalink, autoplay, recommendation engine
├── events/            # Discord event handlers
├── services/          # Service layer (music, stats)
├── ui/                # Embed builders
├── database/          # MongoDB models & repositories
├── dashboard/         # Web dashboard (Express + Chart.js)
│   └── public/        # Static assets (HTML, CSS, JS)
├── config/            # Configuration files
└── index.js           # Entry point
```

## Dashboard

Paperplane includes a full-featured web dashboard with Discord OAuth2 login:

- **Player Panel** — Real-time now-playing, queue with pagination
- **Controls** — Play, pause, skip, stop, volume slider
- **Settings** — Prefix configuration
- **Statistics** — Track types, top tracks, top users, top commands with Chart.js graphs
- **Filters** — Last 7, 30, or 90 days

## License

MIT

<p align="center"><i>Paperplane 🛩️ — taking your Discord experience to the cloud.</i></p>
