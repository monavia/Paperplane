<p align="center">
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=monavia&repo=paperplane&theme=tokyonight" alt="Repo Card" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white" />
  <img src="https://img.shields.io/badge/Lavalink-FF6B6B?style=for-the-badge&logo=discord&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge" />
</p>

<h1 align="center">🛩️ Paperplane</h1>
<p align="center"><b>Music • AI • Moderation • Utility — Your All-in-One Discord Bot</b></p>

---

## ✨ Why Paperplane?

| Feature | Description |
|---|---|
| 🎵 **Music** | High-quality audio via Lavalink — play, queue, skip, loop, shuffle |
| 🤖 **AI Assistant** | Powered by local Ollama models — no API costs, full privacy |
| ⚡ **Hybrid Commands** | Slash (`/`) & prefix (`!`) commands, fully synced |
| 💾 **Persistent Settings** | Guild config saved via MongoDB |
| 📋 **Playlist Import** | Full YouTube playlist support |
| 🛡️ **Reliable** | Built with discord.js v14, battle-tested |

## 🚀 What Makes It Unique

- **Self-hosted AI** — No external API keys needed; runs on your own Ollama instance
- **Zero dependency on paid services** — Fully local operation
- **Modular architecture** — Easy to extend with new commands and features
- **Minimal resource usage** — Designed for efficiency

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
| `Send Messages` | Menampilkan respon dan embed |
| `Embed Links` | Mengirim rich embed |
| `Read Message History` | Membaca perintah slash |
| `Connect` | Bergabung ke voice channel |
| `Speak` | Memutar musik |
| `Use Voice Activity` | Deteksi suara |

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
- [Lavalink](https://github.com/lavalink-devs/Lavalink) server (music)
- [MongoDB](https://www.mongodb.com/) (optional — guild settings)
- [Ollama](https://ollama.com/) (optional — AI features)

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DISCORD_TOKEN` | Bot token | — |
| `CLIENT_ID` | Application ID | — |
| `PREFIX` | Prefix for text commands | `!` |
| `LAVALINK_HOST` | Lavalink host | `localhost` |
| `LAVALINK_PORT` | Lavalink port | `2333` |
| `LAVALINK_PASSWORD` | Lavalink password | `youshallnotpass` |
| `OLLAMA_HOST` | Ollama API URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model name | `llama3` |
| `DATABASE_URI` | MongoDB connection string | — |

## Commands

### Music
| Command | Description |
|---|---|
| `!play / !p <query>` | Play a song or add to queue |
| `!skip` | Skip current track |
| `!stop` | Stop playback & disconnect |
| `!pause / !resume` | Pause / Resume playback |
| `!queue` | Show upcoming tracks |
| `!shuffle` | Shuffle the queue |
| `!loop` | Toggle loop mode |
| `!seek <time>` | Seek to position |
| `!volume <0-200>` | Adjust volume |

### AI
| Command | Description |
|---|---|
| `seryn, <message>` | Natural language command |

## Project Structure

```
src/
├── commands/       # Slash & prefix commands
├── core/           # Core logic (music, AI, state, utils)
├── events/         # Discord event handlers
├── services/       # Service layer
├── ui/             # Embed builders
├── database/       # MongoDB models & repositories
├── config/         # Configuration files
└── index.js        # Entry point
```

## License

MIT

<p align="center"><i>Paperplane — Lightweight, powerful, and yours.</i></p>
