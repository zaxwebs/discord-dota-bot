# 🛡️ Dota 2 AI Discord Bot

A Dota 2 companion for Discord! This bot provides real-time stats on the **top Dota 2 heroes by role** and features an **AI-powered Q&A engine** to analyze matches, meta trends, and deep-dive into complex game mechanics.

---

## Usage

| Command                        | Description                                      |
| ------------------------------ | ------------------------------------------------ |
| `/topheroes`                   | Shows the top 5 heroes for **every** role        |
| `/topheroes role:Carry`        | Shows the top 5 heroes for a specific role       |
| `/topheroes role:Mid count:10` | Shows the top 10 heroes for a specific role      |
| `/hero name:Pudge`             | Look up a hero — stats, attributes, roles, win rate |
| `/ask question:`               | Ask a Dota 2 question or prompt a match ID analysis (AI-powered)|
| `/investigate question:`       | Deep research a complex Dota 2 question using recent web data |
| `/movies`                      | Get 5 random top movie recommendations (now playing) |
| `/coinflip`                    | Flip a coin (Heads or Tails)                     |
| `/soundboard sound:`           | Play a custom sound effect in your voice channel |
| `/help`                        | Show all available commands                       |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A Discord account

### 1. Create a Discord Application & Bot

1. Go to the **[Discord Developer Portal](https://discord.com/developers/applications)**.
2. Click **"New Application"** → give it a name (e.g. `Dota Hero Bot`) → click **Create**.
3. On the application page, find the **Application ID** — this is your **`CLIENT_ID`**. Copy it.
4. Go to the **Bot** tab (left sidebar) → click **"Add Bot"** if prompted → confirm.
5. Click **"Reset Token"** → copy the token — this is your **`DISCORD_TOKEN`**. Save it somewhere safe; you can only see it once.

> **Never share your bot token.** Anyone with it can control your bot.

### 2. Invite the Bot to Your Server

1. Go to the **OAuth2** tab (left sidebar) → **URL Generator**.
2. Under **Scopes**, check `bot` and `applications.commands`.
3. Under **Bot Permissions**, check `Send Messages` and `Use Slash Commands`.
4. Copy the generated URL at the bottom and open it in your browser.
5. Select the server you want to add the bot to → click **Authorize**.

### 3. Clone & Install

```bash
git clone <your-repo-url>
cd discord-dota
npm install
```

### 4. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DISCORD_TOKEN=paste_your_bot_token_here
CLIENT_ID=paste_your_application_id_here

TMDB_API_KEY=paste_your_tmdb_api_key_here
OPENAI_API_KEY=paste_your_openai_api_key_here
API_PORT=3000
```

| Variable         | What It Is                                         | Where to Find It                                                              |
| ---------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `DISCORD_TOKEN`  | The secret token that lets your bot log in          | [Developer Portal](https://discord.com/developers/applications) → Bot → Token |
| `CLIENT_ID`      | The unique ID of your Discord application (bot)     | [Developer Portal](https://discord.com/developers/applications) → General Information → Application ID |
| `TMDB_API_KEY`   | API key for movie recommendations                  | [TMDB Settings](https://www.themoviedb.org/settings/api) → Request an API Key (free) |
| `OPENAI_API_KEY` | API key for AI-powered `/ask` feature              | [OpenAI](https://platform.openai.com/api-keys) → Create new secret key |
| `API_PORT`       | Port for the HTTP API server (default: `3000`)     | Optional — set if port 3000 is in use |



### 5. Deploy Slash Commands

Register slash commands with Discord (run again whenever you add or change commands):

```bash
npm run deploy
```

### 6. Start the Bot

```bash
npm start
```

You should see:

```
Logged in as YourBot#1234
Serving 1 server(s)
🌐 API server listening on port 3000
```

---

## HTTP API

The bot also exposes a local HTTP API for programmatic soundboard control.

### `GET /api/soundboard/list`

Returns all available sound names.

```json
{ "sounds": ["outro", "passed", "run", "wow"] }
```

### `POST /api/soundboard/play`

Plays a sound in a Discord voice channel.

**Request body:**

```json
{ "channelId": "YOUR_CHANNEL_ID", "sound": "outro" }
```

**Response:**

```json
{ "success": true, "message": "Playing \"outro\" in #Dota 2" }
```

**Example (PowerShell):**

```powershell
# List sounds
Invoke-RestMethod http://localhost:3000/api/soundboard/list

# Play a sound
Invoke-RestMethod -Uri http://localhost:3000/api/soundboard/play -Method POST -ContentType "application/json" -Body '{"channelId": "YOUR_CHANNEL_ID", "sound": "wow"}'
```

---

## Project Structure

```
discord-dota/
├── src/
│   ├── bot.js              # Main bot entrypoint
│   ├── server.js           # Express HTTP API for soundboard control
│   ├── deploy-commands.js  # Registers slash commands with Discord
│   ├── heroes.js           # Fetches & filters hero data
│   ├── movies.js           # TMDB API for movie recommendations
│   ├── embeds.js           # Builds rich embed messages
│   ├── api.js              # OpenDota API helper
│   ├── ask.js              # GPT-4o-mini powered Q&A system
│   ├── logger.js           # Morgan-based logging for bot interactions
│   ├── investigate.js      # Deep research a complex Dota 2 question using recent web data
│   └── soundboard.js       # Play MP3 files from the sounds directory in voice channels
├── sounds/                 # MP3 files for the soundboard
├── .env                    # Your secrets (not committed)
├── .env.example            # Template for .env
└── package.json
```

---

## License

MIT
