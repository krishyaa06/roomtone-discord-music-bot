# Roomtone Discord Music Bot

A Discord voice bot with a read-only dashboard for bot status, setup guidance, recent activity, and supported playback commands.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Optional secret: `DISCORD_BOT_TOKEN` — connects the bot to Discord; the dashboard works without it

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Voice bot: discord.js, @discordjs/voice, ffmpeg
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (ESM bundle)

## Where things live

- `artifacts/discord-music` — dashboard pages and theme
- `artifacts/api-server/src/lib/music-bot.ts` — Discord bot runtime and voice playback
- `artifacts/api-server/src/routes/music.ts` — dashboard status endpoints
- `lib/api-spec/openapi.yaml` — API contract; regenerate clients after edits
- `lib/api-client-react` and `lib/api-zod` — generated API hooks and schemas

## Architecture decisions

- Playback controls live in Discord slash commands; the public dashboard is read-only.
- `/play` accepts direct HTTPS audio streams or files and rejects non-audio responses and non-public hosts.
- The API server starts the bot only when `DISCORD_BOT_TOKEN` is configured; a missing token does not prevent the dashboard from loading.

## Product

Users can monitor bot connection health and discover setup instructions from the dashboard, then join a voice channel and control audio playback with Discord slash commands.

## User preferences

Match the user's existing Prism Protocol identity: near-black surfaces, cyan/violet/green/magenta accents, their Prism logo, animated presentation, and detailed project docs.

## Gotchas

- Set `DISCORD_BOT_TOKEN` in Replit Secrets, then restart the API Server workflow for the bot to connect.
- The API server needs `ffmpeg` available on PATH to convert supported audio streams for Discord voice.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
