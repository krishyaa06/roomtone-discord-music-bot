import { randomUUID } from "node:crypto";
import { lookup as dnsLookup } from "node:dns/promises";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  type AudioPlayer,
  type VoiceConnection,
} from "@discordjs/voice";
import {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type Guild,
} from "discord.js";
import { logger } from "./logger";

type BotState = "online" | "offline" | "starting" | "misconfigured";
type ActivityKind = "system" | "playback" | "warning";

interface ActivityItem {
  id: string;
  message: string;
  createdAt: string;
  kind: ActivityKind;
}

interface Track {
  url: string;
  host: string;
  requestedBy: string;
}

interface GuildSession {
  player: AudioPlayer;
  connection: VoiceConnection;
  current: Track | null;
  queue: Track[];
  process: ChildProcessWithoutNullStreams | null;
  loading: boolean;
  generation: number;
}

const commands = [
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a direct audio stream in your voice channel")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("HTTPS link to a direct audio stream or audio file")
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current track"),
  new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the paused track"),
  new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current track"),
  new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current track and upcoming queue"),
  new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playback and clear the queue"),
  new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Stop playback and leave the voice channel"),
];

const commandHelp = [
  {
    name: "/play",
    description: "Play a direct HTTPS audio stream or audio file.",
    usage: "/play url:<direct-audio-url>",
  },
  {
    name: "/pause",
    description: "Pause the current track.",
    usage: "/pause",
  },
  {
    name: "/resume",
    description: "Resume paused playback.",
    usage: "/resume",
  },
  {
    name: "/skip",
    description: "Skip to the next queued track.",
    usage: "/skip",
  },
  {
    name: "/queue",
    description: "Show the current track and upcoming tracks.",
    usage: "/queue",
  },
  {
    name: "/stop",
    description: "Stop playback and clear the queue.",
    usage: "/stop",
  },
  {
    name: "/leave",
    description: "Stop playback and leave voice chat.",
    usage: "/leave",
  },
];

const sessions = new Map<string, GuildSession>();
const activity: ActivityItem[] = [];
let state: BotState = process.env.DISCORD_BOT_TOKEN ? "starting" : "misconfigured";
let botName: string | null = null;
let botId: string | null = null;
let detail = process.env.DISCORD_BOT_TOKEN
  ? "Connecting to Discord."
  : "Add DISCORD_BOT_TOKEN to Replit Secrets, then restart the API server.";
let botClient: Client | null = null;

function recordActivity(message: string, kind: ActivityKind): void {
  activity.unshift({
    id: randomUUID(),
    message,
    createdAt: new Date().toISOString(),
    kind,
  });
  activity.splice(30);
}

function stopProcess(session: GuildSession): void {
  const audioProcess = session.process;
  session.process = null;
  if (audioProcess && audioProcess.exitCode === null) {
    audioProcess.kill("SIGTERM");
  }
}

function isPublicIpv4(address: string): boolean {
  if (isIP(address) !== 4) return false;
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => part < 0 || part > 255)) {
    return false;
  }

  const [a, b, c] = octets;
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 0 || b === 168)) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function parsePublicAudioUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Enter a valid audio URL.");
  }

  if (
    url.protocol !== "https:" ||
    url.port !== "" ||
    url.username ||
    url.password ||
    isIP(url.hostname)
  ) {
    throw new Error("Use a public HTTPS audio URL on the standard port.");
  }
  return url;
}

async function openPublicAudioStream(rawUrl: string): Promise<IncomingMessage> {
  const url = parsePublicAudioUrl(rawUrl);
  const resolved = await dnsLookup(url.hostname, { all: true, verbatim: true });
  if (
    resolved.length === 0 ||
    resolved.some((result) => result.family !== 4 || !isPublicIpv4(result.address))
  ) {
    throw new Error("That audio host is not publicly reachable.");
  }

  const pinnedAddress = resolved[0].address;
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      {
        hostname: url.hostname,
        port: 443,
        method: "GET",
        path: `${url.pathname}${url.search}`,
        servername: url.hostname,
        timeout: 15_000,
        lookup: (_hostname, options, callback) => {
          if (options && typeof options === "object" && "all" in options && options.all) {
            callback(null, [{ address: pinnedAddress, family: 4 }]);
          } else {
            callback(null, pinnedAddress, 4);
          }
        },
        headers: {
          "user-agent": "RoomtoneBot/1.0",
          accept: "audio/*,application/ogg,application/octet-stream",
        },
      },
      (response) => {
        const contentType = response.headers["content-type"]?.split(";")[0].trim() ?? "";
        const isAudio =
          contentType.startsWith("audio/") ||
          contentType === "application/ogg" ||
          contentType === "application/octet-stream";
        if (
          response.statusCode !== 200 ||
          !isAudio ||
          response.headers.location
        ) {
          response.destroy();
          reject(new Error("The URL did not return a direct audio stream."));
          return;
        }
        resolve(response);
      },
    );
    request.once("timeout", () => request.destroy(new Error("Audio source timed out.")));
    request.once("error", reject);
    request.end();
  });
}

function formatTrack(track: Track): string {
  return `${track.host} — requested by ${track.requestedBy}`;
}

function getSession(guild: Guild, channelId: string): GuildSession {
  const existing = sessions.get(guild.id);
  if (existing) return existing;

  const connection = joinVoiceChannel({
    channelId,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true,
  });
  const player = createAudioPlayer({
    behaviors: { noSubscriber: NoSubscriberBehavior.Stop },
  });
  const session: GuildSession = {
    player,
    connection,
    current: null,
    queue: [],
    process: null,
    loading: false,
    generation: 0,
  };
  sessions.set(guild.id, session);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    stopProcess(session);
    session.current = null;
    void playNext(session);
  });
  player.on("error", () => {
    recordActivity("A track ended unexpectedly.", "warning");
    stopProcess(session);
    session.current = null;
    void playNext(session);
  });
  connection.on(VoiceConnectionStatus.Disconnected, () => {
    recordActivity("The bot disconnected from a voice channel.", "warning");
    session.generation += 1;
    session.loading = false;
    stopProcess(session);
    sessions.delete(guild.id);
    connection.destroy();
  });
  return session;
}

async function playNext(session: GuildSession): Promise<void> {
  if (session.loading || session.player.state.status !== AudioPlayerStatus.Idle) {
    return;
  }
  const track = session.queue.shift();
  if (!track) {
    session.current = null;
    return;
  }

  session.loading = true;
  const generation = ++session.generation;
  session.current = track;
  let audioProcess: ChildProcessWithoutNullStreams | null = null;
  try {
    const source = await openPublicAudioStream(track.url);
    if (generation !== session.generation) {
      source.destroy();
      return;
    }
    audioProcess = spawn(
      process.env.FFMPEG_PATH ?? "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        "pipe:0",
        "-vn",
        "-c:a",
        "libopus",
        "-b:a",
        "96k",
        "-application",
        "audio",
        "-f",
        "ogg",
        "pipe:1",
      ],
      { stdio: ["pipe", "pipe", "pipe"] },
    );
    audioProcess.stderr.resume();
    session.process = audioProcess;
    source.pipe(audioProcess.stdin);
    audioProcess.once("error", () => {
      if (generation !== session.generation) return;
      recordActivity("Audio conversion failed; moving to the next item.", "warning");
      stopProcess(session);
      session.current = null;
      session.loading = false;
      void playNext(session);
    });
    audioProcess.once("close", (code) => {
      if (code && code !== 0 && session.process === audioProcess) {
        recordActivity("Audio conversion failed; moving to the next item.", "warning");
      }
    });

    const resource = createAudioResource(audioProcess.stdout, {
      inputType: StreamType.OggOpus,
      metadata: track,
    });
    session.player.play(resource);
    recordActivity(`Now playing ${track.host}.`, "playback");
  } catch {
    if (generation !== session.generation) return;
    audioProcess?.kill("SIGTERM");
    session.process = null;
    session.current = null;
    recordActivity("A queued audio source could not be opened.", "warning");
  } finally {
    if (generation === session.generation) {
      session.loading = false;
    }
    if (
      generation === session.generation &&
      session.player.state.status === AudioPlayerStatus.Idle &&
      session.queue.length > 0
    ) {
      void playNext(session);
    }
  }
}

function getGuildSession(interaction: ChatInputCommandInteraction): GuildSession | null {
  if (!interaction.guild) return null;
  return sessions.get(interaction.guild.id) ?? null;
}

async function respond(
  interaction: ChatInputCommandInteraction,
  content: string,
): Promise<void> {
  await interaction.reply({ content, ephemeral: true });
}

async function handleCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!interaction.guild) {
    await respond(interaction, "Use this command inside a server.");
    return;
  }

  if (interaction.commandName === "play") {
    const rawUrl = interaction.options.getString("url", true);
    let url: URL;
    try {
      url = parsePublicAudioUrl(rawUrl);
    } catch (error) {
      await respond(
        interaction,
        error instanceof Error ? error.message : "Enter a valid audio URL.",
      );
      return;
    }

    const voiceChannelId = interaction.guild.voiceStates.cache.get(
      interaction.user.id,
    )?.channelId;
    if (!voiceChannelId) {
      await respond(interaction, "Join a voice channel before using /play.");
      return;
    }

    const session = getSession(interaction.guild, voiceChannelId);
    const track: Track = {
      url: url.toString(),
      host: url.hostname,
      requestedBy: interaction.user.username,
    };
    session.queue.push(track);
    recordActivity(`Queued audio from ${track.host}.`, "playback");
    if (session.player.state.status === AudioPlayerStatus.Idle) {
      void playNext(session);
    }
    await respond(interaction, `Added ${track.host} to the queue.`);
    return;
  }

  const session = getGuildSession(interaction);
  if (!session) {
    await respond(interaction, "Nothing is playing in this server yet.");
    return;
  }

  switch (interaction.commandName) {
    case "pause":
      if (!session.player.pause()) {
        await respond(interaction, "There is no track to pause.");
        return;
      }
      await respond(interaction, "Playback paused.");
      return;
    case "resume":
      if (!session.player.unpause()) {
        await respond(interaction, "There is no paused track to resume.");
        return;
      }
      await respond(interaction, "Playback resumed.");
      return;
    case "skip":
      if (!session.current) {
        await respond(interaction, "There is no track to skip.");
        return;
      }
      session.generation += 1;
      session.loading = false;
      stopProcess(session);
      session.player.stop(true);
      if (session.player.state.status === AudioPlayerStatus.Idle) {
        session.current = null;
        void playNext(session);
      }
      await respond(interaction, "Skipped the current track.");
      return;
    case "queue": {
      const nowPlaying = session.current
        ? `Now playing: ${formatTrack(session.current)}`
        : "Nothing is playing right now.";
      const upcoming = session.queue
        .slice(0, 10)
        .map((track, index) => `${index + 1}. ${formatTrack(track)}`);
      await respond(
        interaction,
        [nowPlaying, ...upcoming].join("\n").slice(0, 1900),
      );
      return;
    }
    case "stop":
      session.generation += 1;
      session.loading = false;
      session.queue = [];
      session.current = null;
      stopProcess(session);
      session.player.stop(true);
      await respond(interaction, "Playback stopped and the queue was cleared.");
      return;
    case "leave":
      session.generation += 1;
      session.loading = false;
      session.queue = [];
      session.current = null;
      stopProcess(session);
      session.player.stop(true);
      session.connection.destroy();
      sessions.delete(interaction.guild.id);
      await respond(interaction, "Left the voice channel.");
      return;
    default:
      await respond(interaction, "That command is not supported.");
  }
}

export function getMusicBotStatus() {
  return {
    state,
    botName,
    botId,
    guildCount: botClient?.guilds.cache.size ?? 0,
    latencyMs:
      botClient && botClient.ws.ping >= 0 ? Math.round(botClient.ws.ping) : null,
    detail,
  };
}

export function getMusicCommands() {
  return commandHelp;
}

export function getMusicActivity() {
  return activity.slice(0, 20);
}

export async function startMusicBot(): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    state = "misconfigured";
    detail = "Add DISCORD_BOT_TOKEN to Replit Secrets, then restart the API server.";
    recordActivity("Discord bot token is not configured.", "warning");
    return;
  }

  state = "starting";
  detail = "Connecting to Discord.";
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });
  botClient = client;

  client.once(Events.ClientReady, (readyClient) => {
    botName = readyClient.user.username;
    botId = readyClient.user.id;
    state = "online";
    detail = "Connected to Discord and ready for slash commands.";
    recordActivity("Discord bot connected.", "system");

    const rest = new REST({ version: "10" }).setToken(token);
    void rest
      .put(Routes.applicationCommands(readyClient.user.id), {
        body: commands.map((command) => command.toJSON()),
      })
      .then(() => {
        recordActivity("Slash commands are registered.", "system");
      })
      .catch(() => {
        recordActivity("Slash command registration failed.", "warning");
        logger.warn("Discord slash command registration failed");
      });
  });

  client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    void handleCommand(interaction).catch(async () => {
      recordActivity("A Discord command failed unexpectedly.", "warning");
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "That command could not be completed.",
          ephemeral: true,
        });
      } else {
        await respond(interaction, "That command could not be completed.");
      }
    });
  });

  try {
    await client.login(token);
  } catch {
    state = "misconfigured";
    detail = "Discord sign-in failed. Check the bot token and restart the API server.";
    recordActivity("Discord connection failed.", "warning");
    logger.warn("Discord bot login failed");
  }
}
