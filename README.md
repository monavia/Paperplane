# Paperplane 🛩️

A multifunctional Discord bot with music playback (Lavalink), local AI assistant (Ollama), and more.

## Features

- 🎵 **Music** — High-quality audio via Lavalink, playlist support, queue management
- 🤖 **AI Assistant** — Natural language commands via local Ollama models (no API costs)
- ⚡ **Slash + Prefix Commands** — Full parity between `/` and `!` commands
- 💾 **Persistent Settings** — Guild configuration via MongoDB
- 📋 **Playlist Import** — YouTube playlist support
- 🔀 **Queue Controls** — Shuffle, loop, skip, seek, volume

## Requirements

- [Node.js](https://nodejs.org/) v18+
- [Lavalink](https://github.com/lavalink-devs/Lavalink) server (music)
- [MongoDB](https://www.mongodb.com/) (optional — guild settings)
- [Ollama](https://ollama.com/) (optional — AI features)

## Quick Start

```bash
# Clone & install
git clone https://github.com/monavia/paperplane
cd paperplane
npm install

# Configure
cp .env.example .env
# Edit .env with your bot token and settings

# Run
npm start
```

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
