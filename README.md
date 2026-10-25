# Roomtone Discord Music Bot

A Discord voice bot with a read-only web dashboard for connection status, recent activity, commands, and setup guidance.

## What it does

- `/play` queues a direct HTTPS audio file or stream while you are in a voice channel.
- `/pause`, `/resume`, `/skip`, `/queue`, `/stop`, and `/leave` control playback in Discord.
- The dashboard shows live Discord connection status, server count, latency, supported commands, and recent activity.
- Audio URLs must point directly to an audio response. Video pages and service-download or stream-extraction links are not supported.
- Only play audio you have permission to use.

## Set up the Discord bot

1. Create an application in the [Discord Developer Portal](https://discord.com/developers/applications), add a bot, and copy its bot token.
2. Invite it to your server with the `bot` and `applications.commands` scopes and the `Connect` and `Speak` permissions.
3. Add the token as the `DISCORD_BOT_TOKEN` Replit Secret. Never commit the token to GitHub or put it in a `.env` file.
4. Restart the API Server workflow. The dashboard should change from “needs setup” to “online.”
5. Join a voice channel and use `/play` with a direct HTTPS audio URL.

The bot registers its slash commands when it connects. It uses Discord's `Guilds` and `GuildVoiceStates` intents and does not need the privileged message-content intent.

## Run in Replit

The project uses the Replit workflows for the web dashboard and API server. The API server also runs the Discord bot and requires `ffmpeg` for audio conversion; the Replit environment installs it as a system dependency.

## Project structure

- `artifacts/discord-music` — web dashboard
- `artifacts/api-server` — API routes and Discord bot runtime
- `lib/api-spec/openapi.yaml` — API contract
- `lib/api-client-react` and `lib/api-zod` — generated API hooks and validation schemas

## Checks

```sh
pnpm run typecheck
```

## Local configuration reference

See `.env.example` for the names of runtime settings. Store secrets in Replit Secrets rather than in source files.
