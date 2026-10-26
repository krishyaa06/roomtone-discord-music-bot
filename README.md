<div align="center">
  <img src="assets/logo.png" width="96" alt="Roomtone logo" />
  <br />
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:060810,50:6C63FF,100:00D2FF&height=220&section=header&text=ROOMTONE&fontSize=54&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Prism%20Protocol%20%E2%80%A2%20Discord%20Music%20Bot%20%2B%20Dashboard&descAlignY=60&descSize=16" width="100%" alt="Roomtone — Prism Protocol Discord music bot" />
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=18&duration=2600&pause=800&color=00D2FF&center=true&vCenter=true&width=700&lines=Shared+listening%2C+managed+in+Discord;Slash+commands+%E2%80%A2+Voice+playback+%E2%80%A2+Live+status;A+Prism+Protocol+community+tool" alt="Roomtone features" />
  <br /><br />
  <a href="https://github.com/krishyaa06/roomtone-discord-music-bot"><img src="https://img.shields.io/badge/Discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord.js v14" /></a>
  <img src="https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 24" />
  <img src="https://img.shields.io/badge/Voice-Opus%20%2B%20FFmpeg-6C63FF?style=for-the-badge" alt="Opus and FFmpeg" />
  <img src="https://img.shields.io/badge/Dashboard-React%20%2B%20Vite-6C63FF?style=for-the-badge" alt="React and Vite dashboard" />
  <br />
  <a href="https://krishyaa06.github.io/prism-bots-panel/#/dashboard/roomtone"><img src="https://img.shields.io/badge/Prism_Bots_Panel-Open-00D2FF?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Open in Prism Bots Panel" /></a>
  <a href="https://dc.gg/prismprotocol"><img src="https://img.shields.io/badge/Prism_Protocol-Private_bot-FF5EA8?style=for-the-badge&logo=discord&logoColor=white" alt="Private Prism Protocol bot" /></a>
</div>

<p align="center">
  <img src="assets/banner.png" width="100%" alt="Roomtone banner" />
</p>

> [!NOTE]
> **Private bot for the [Prism Protocol](https://dc.gg/prismprotocol) server.** Roomtone runs our community listening sessions and is not open for public invites. Want a music bot for your own server? Try the free [Prism music bots](https://krishyaa06.github.io/prism-bots-panel/).

Roomtone is a Discord voice bot with a live, read-only dashboard for connection status, server count, latency, recent activity, and supported commands. The interface follows the dark, neon-accented Prism Protocol identity.

## Preview

The dashboard is available in this project's Replit preview. A public deployment URL has not been created yet.

<p align="center">
  <img src="artifacts/discord-music/public/dashboard-preview.jpg" width="100%" alt="Roomtone dashboard preview" />
</p>

The preview shows the bot connected at capture time. The dashboard reads current connection status and activity from the API.

## Features

- Slash commands for `/play`, `/pause`, `/resume`, `/skip`, `/queue`, `/stop`, and `/leave`.
- `/play` accepts a direct HTTPS audio file or stream URL. It does not extract audio from video or music-service pages.
- The bot joins the voice channel of the person who runs `/play`.
- The dashboard displays connection status, server count, gateway latency, recent bot activity, and command usage.
- The dashboard is informational only; playback controls stay in Discord.
- Discord slash commands are registered when the bot connects. The bot does not request the privileged message-content intent.
- Audio URLs are checked before playback; local and private IPv4 destinations are rejected.
- The interface uses the Prism Protocol logo, dark terminal-inspired surfaces, cyan/violet accents, and reduced-motion-aware animation.

Only play audio that you have permission to use.

## Set up the Discord bot

1. In the [Discord Developer Portal](https://discord.com/developers/applications), create an application and add a bot.
2. Invite the bot with the `bot` and `applications.commands` scopes, plus the `Connect` and `Speak` permissions.
3. Add the bot token as a Replit Secret named `DISCORD_BOT_TOKEN`. Do not paste the token into source code, `.env`, or GitHub.
4. Restart the **API Server** workflow. The dashboard will show the live connection state once the bot connects.
5. Join a voice channel, then run `/play` in a server text channel with a direct HTTPS audio URL.

Example:

```text
/play url:https://your-audio-host.example/track.mp3
```

The URL must respond directly with audio. YouTube, Spotify, SoundCloud pages, and other page URLs are not supported.

## Run in Replit

The workspace has separate web-dashboard and API-server workflows. The API server also runs the Discord bot and uses `ffmpeg` for audio conversion. The dashboard can start without a bot token, but the bot will remain unconfigured until `DISCORD_BOT_TOKEN` is added through Replit Secrets.

## Project structure

| Path | Purpose |
| --- | --- |
| `artifacts/discord-music` | React dashboard and setup guide |
| `artifacts/api-server/src/lib/music-bot.ts` | Discord voice bot runtime |
| `artifacts/api-server/src/routes/music.ts` | Dashboard API endpoints |
| `lib/api-spec/openapi.yaml` | API contract |
| `lib/api-client-react` and `lib/api-zod` | Generated API hooks and schemas |

## Checks

```sh
pnpm run typecheck
pnpm --filter @workspace/api-server run build
```

## Prism Bots Panel

Roomtone's status also shows up in the [Prism Bots Panel](https://krishyaa06.github.io/prism-bots-panel/#/dashboard/roomtone). Set `bots.roomtone.apiUrl` in the panel's `js/config.js` to this API server's public URL (for example the Replit deployment URL). The panel reads `/api/music/status` (CORS is already enabled in the API server).

## Branding

| File | Use |
| --- | --- |
| `assets/logo.svg` / `assets/logo.png` | Logo |
| `assets/banner.png` | README / social preview (1280×400) |
| `assets/discord/avatar.png` | Discord avatar / app icon (1024×1024) |
| `assets/discord/profile-banner.png` | Discord profile banner (1360×480) |

## Configuration

See `.env.example` for configuration names. Store real credentials in Replit Secrets; never commit them to the repository.
