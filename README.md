# Discord Dota 2 Hero Bot

A Discord bot that shows the **top Dota 2 heroes by role** (ranked by win rate) and provides **AI-powered Dota 2 Q&A** with organic match analysis.

Use the `/topheroes` slash command to see the best picks for any role — Carry, Mid, Offlane, Support, and more. Use `/ask` to ask any meta question or get summaries of specific matches!

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
```

| Variable         | What It Is                                         | Where to Find It                                                              |
| ---------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `DISCORD_TOKEN`  | The secret token that lets your bot log in          | [Developer Portal](https://discord.com/developers/applications) → Bot → Token |
| `CLIENT_ID`      | The unique ID of your Discord application (bot)     | [Developer Portal](https://discord.com/developers/applications) → General Information → Application ID |
| `TMDB_API_KEY`   | API key for movie recommendations                  | [TMDB Settings](https://www.themoviedb.org/settings/api) → Request an API Key (free) |
| `OPENAI_API_KEY` | API key for AI-powered `/ask` feature              | [OpenAI](https://platform.openai.com/api-keys) → Create new secret key |



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
```

---

## Usage

| Command                        | Description                                      |
| ------------------------------ | ------------------------------------------------ |
| `/topheroes`                   | Shows the top 5 heroes for **every** role        |
| `/topheroes role:Carry`        | Shows the top 5 heroes for a specific role       |
| `/topheroes role:Mid count:10` | Shows the top 10 heroes for a specific role      |
| `/hero name:Pudge`             | Look up a hero — stats, attributes, roles, win rate |
| `/ask question:`               | Ask a Dota 2 question or prompt a match ID analysis (AI-powered)|
| `/movies`                      | Get 5 random top movie recommendations (now playing) |
| `/coinflip`                    | Flip a coin (Heads or Tails)                     |
| `/help`                        | Show all available commands                       |

---

## Project Structure

```
discord-dota/
├── src/
│   ├── bot.js              # Main bot entrypoint
│   ├── deploy-commands.js  # Registers slash commands with Discord
│   ├── heroes.js           # Fetches & filters hero data
│   ├── movies.js           # TMDB API for movie recommendations
│   ├── embeds.js           # Builds rich embed messages
│   ├── api.js              # OpenDota API helper
│   └── ask.js              # GPT-4o-mini powered Q&A system
├── .env                    # Your secrets (not committed)
├── .env.example            # Template for .env
└── package.json
```

---

## License

MIT
