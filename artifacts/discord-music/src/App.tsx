import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Activity, ArrowRight, AudioLines, Bot, Check, ChevronRight,
  CircleAlert, CircleDashed, Clock3, Command, Headphones,
  HeartPulse, LifeBuoy, Link2, Radio, RefreshCw, Server, ShieldCheck, Signal,
  SquareTerminal, Waves, Wifi, WifiOff,
} from 'lucide-react';
import {
  getGetMusicActivityQueryKey,
  getGetMusicBotStatusQueryKey,
  getGetMusicCommandsQueryKey,
  getHealthCheckQueryKey,
  useGetMusicActivity,
  useGetMusicBotStatus,
  useGetMusicCommands,
  useHealthCheck,
} from '@workspace/api-client-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Shell({ children, page }: { children: ReactNode; page: 'overview' | 'setup' }) {
  const nav = [
    { href: '/', name: 'Overview', icon: Activity, active: page === 'overview' },
    { href: '/setup', name: 'Setup guide', icon: SquareTerminal, active: page === 'setup' },
  ];
  return (
    <div className="shell flex bg-background">
      <aside className="hidden w-[252px] shrink-0 flex-col bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] md:flex">
        <div className="flex items-center gap-3 px-7 pb-9 pt-8">
          <div className="grid size-10 place-items-center rounded-xl bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]">
            <AudioLines size={21} strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-display text-[17px] font-bold tracking-[-.04em]">ROOMTONE</div>
            <div className="eyebrow mt-1 text-white/45">music bot console</div>
          </div>
        </div>
        <div className="px-5">
          <div className="eyebrow mb-3 px-3 text-white/35">Workspace</div>
          <div className="mb-7 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.045] px-3 py-3">
            <div className="grid size-9 place-items-center rounded-lg bg-white/10 text-white/75"><Headphones size={17} /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Community audio</p>
              <p className="mt-0.5 text-xs text-white/45">Public status view</p>
            </div>
            <ChevronRight size={15} className="text-white/35" />
          </div>
          <div className="eyebrow mb-3 px-3 text-white/35">Control room</div>
          <nav className="space-y-1">
            {nav.map(({ href, name, icon: Icon, active }) => (
              <Link key={href} href={href} data-testid={`link-nav-${name.toLowerCase().replaceAll(' ', '-')}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/[.06] hover:text-white/90'}`}>
                <Icon size={17} strokeWidth={1.9} />
                <span>{name}</span>
                {active && <span className="ml-auto size-1.5 rounded-full bg-[hsl(var(--sidebar-primary))]" />}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-5">
          <div className="rounded-2xl border border-white/10 bg-white/[.045] p-4">
            <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary))]/15 text-[hsl(var(--sidebar-primary))]"><ShieldCheck size={17} /></div>
            <p className="text-sm font-semibold">Status, not controls</p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/50">This dashboard is read-only. Playback is managed in your Discord server.</p>
            <Link href="/setup" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--sidebar-primary))] hover:text-white" data-testid="link-sidebar-setup">
              View setup guide <ArrowRight size={13} />
            </Link>
          </div>
          <div className="mt-5 flex items-center justify-between px-1 text-[10px] text-white/35">
            <span>ROOMTONE / 01</span><span className="font-mono">v1.0</span>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex h-[66px] max-w-[1420px] items-center justify-between px-5 md:px-10">
            <div className="flex items-center gap-2 md:hidden">
              <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><AudioLines size={17} /></div>
              <span className="font-display text-sm font-bold tracking-[-.04em]">ROOMTONE</span>
            </div>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
              <span className="eyebrow">Control room</span><span className="text-border">/</span>
              <span className="font-medium text-foreground">{page === 'overview' ? 'Overview' : 'Setup guide'}</span>
            </div>
            <nav className="flex items-center gap-1 md:hidden">
              <Link href="/" className={`rounded-lg px-3 py-2 text-xs font-semibold ${page === 'overview' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'}`} data-testid="link-mobile-overview">Overview</Link>
              <Link href="/setup" className={`rounded-lg px-3 py-2 text-xs font-semibold ${page === 'setup' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'}`} data-testid="link-mobile-setup">Setup</Link>
            </nav>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
              <span className="relative flex size-2">
                <span className="status-pulse absolute inline-flex size-full rounded-full bg-primary opacity-65" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="eyebrow !text-[9px] text-muted-foreground">Live monitor</span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1420px] px-5 pb-16 pt-8 md:px-10 md:pt-10">{children}</main>
      </div>
    </div>
  );
}

function SectionTitle({ kicker, title, copy, action }: { kicker: string; title: string; copy?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div><div className="eyebrow mb-2 text-primary">{kicker}</div><h2 className="font-display text-[22px] font-semibold tracking-[-.045em] md:text-[25px]">{title}</h2>
      {copy && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">{copy}</p>}</div>
    {action}
  </div>;
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function QueryError({ retry, label }: { retry: () => void; label: string }) {
  return <div className="flex min-h-[150px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center" data-testid={`error-${label}`}>
    <CircleAlert size={21} className="mb-3 text-destructive" />
    <p className="text-sm font-semibold">Couldn’t load {label}</p>
    <p className="mt-1 text-xs text-muted-foreground">The service may be temporarily unavailable.</p>
    <button onClick={retry} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted" data-testid={`button-retry-${label}`}>
      <RefreshCw size={13} /> Try again
    </button>
  </div>;
}

function statePresentation(state?: string) {
  switch (state) {
    case 'online': return { label: 'Online', icon: Wifi, color: 'text-primary', bg: 'bg-primary/10', dot: 'bg-primary', message: 'Connected and ready for voice sessions.' };
    case 'starting': return { label: 'Starting', icon: CircleDashed, color: 'text-amber-700', bg: 'bg-amber-500/10', dot: 'bg-amber-600', message: 'The bot is getting ready to connect.' };
    case 'misconfigured': return { label: 'Needs attention', icon: CircleAlert, color: 'text-rose-700', bg: 'bg-rose-500/10', dot: 'bg-rose-600', message: 'Configuration needs attention before the bot can connect.' };
    default: return { label: 'Offline', icon: WifiOff, color: 'text-muted-foreground', bg: 'bg-muted', dot: 'bg-muted-foreground', message: 'The bot is not currently connected.' };
  }
}

function timeAgo(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function Overview() {
  const status = useGetMusicBotStatus({ query: { queryKey: getGetMusicBotStatusQueryKey(), refetchInterval: 30000 } });
  const activity = useGetMusicActivity({ query: { queryKey: getGetMusicActivityQueryKey(), refetchInterval: 30000 } });
  const commands = useGetMusicCommands({ query: { queryKey: getGetMusicCommandsQueryKey() } });
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 30000 } });
  const bot = status.data;
  const state = statePresentation(bot?.state);
  const StateIcon = state.icon;

  return <div className="space-y-10">
    <section className="enter flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end md:pb-9">
      <div>
        <div className="eyebrow mb-3 flex items-center gap-2 text-primary"><span className="size-1.5 rounded-full bg-primary" /> Discord music service</div>
        <h1 className="font-display text-[36px] font-semibold leading-[1.05] tracking-[-.065em] md:text-[48px]">A clear signal<br className="hidden sm:block" /> for shared listening.</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">A live view of the music bot serving your community. Playback stays in Discord; this page keeps you informed.</p>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
        <HeartPulse size={15} className="text-primary" />
        <span>Service health</span>
        <span className={`ml-1 font-semibold ${health.isError ? 'text-destructive' : 'text-foreground'}`} data-testid="status-service-health">
          {health.isLoading ? 'Checking' : health.isError ? 'Unavailable' : health.data?.status ?? 'Healthy'}
        </span>
      </div>
    </section>

    <section className="enter-delay grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
      {status.isLoading ? <>
        <div className="panel min-h-[228px] rounded-2xl p-6"><Skeleton className="h-4 w-28" /><Skeleton className="mt-8 h-8 w-40" /><Skeleton className="mt-4 h-4 w-64" /></div>
        <div className="panel min-h-[228px] rounded-2xl p-6"><Skeleton className="h-4 w-24" /><Skeleton className="mt-8 h-9 w-20" /></div>
        <div className="panel min-h-[228px] rounded-2xl p-6"><Skeleton className="h-4 w-24" /><Skeleton className="mt-8 h-9 w-20" /></div>
      </> : status.isError ? <div className="lg:col-span-3"><QueryError retry={() => status.refetch()} label="bot status" /></div> : <>
        <div className="panel relative overflow-hidden rounded-2xl p-6 md:p-7" data-testid="status-bot">
          <div className="absolute -right-5 -top-16 size-48 rounded-full border border-primary/10" />
          <div className="absolute -right-2 -top-9 size-36 rounded-full border border-primary/10" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="eyebrow text-muted-foreground">Connection state</div>
              <div className="mt-5 flex items-center gap-3">
                <span className={`grid size-11 place-items-center rounded-xl ${state.bg} ${state.color}`}><StateIcon size={21} /></span>
                <h2 className="font-display text-[30px] font-semibold tracking-[-.055em]">{state.label}</h2>
              </div>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">{bot?.detail || state.message}</p>
            </div>
            <div className={`relative mt-1 grid size-3 place-items-center rounded-full ${state.dot}`}>
              {bot?.state === 'online' && <span className="status-pulse absolute size-3 rounded-full bg-primary" />}
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Bot size={14} /> {bot?.botName || 'Discord music bot'}</span>
            {bot?.botId && <span className="font-mono text-[10px]">ID {bot.botId}</span>}
          </div>
        </div>
        <div className="panel rounded-2xl p-6" data-testid="metric-guild-count">
          <div className="flex items-center justify-between"><span className="eyebrow text-muted-foreground">Servers</span><Server size={17} className="text-primary" /></div>
          <div className="mt-8 flex items-baseline gap-2"><span className="font-display text-[42px] font-semibold tracking-[-.07em]">{bot?.guildCount.toLocaleString() ?? '—'}</span><span className="text-xs text-muted-foreground">connected</span></div>
          <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">Discord communities served</div>
        </div>
        <div className="panel rounded-2xl p-6" data-testid="metric-latency">
          <div className="flex items-center justify-between"><span className="eyebrow text-muted-foreground">Gateway latency</span><Signal size={17} className="text-primary" /></div>
          <div className="mt-8 flex items-baseline gap-2"><span className="font-display text-[42px] font-semibold tracking-[-.07em]">{bot?.latencyMs ?? '—'}</span><span className="text-xs text-muted-foreground">{bot?.latencyMs == null ? 'not available' : 'ms'}</span></div>
          <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground"><span className={`size-1.5 rounded-full ${bot?.state === 'online' ? 'bg-primary' : 'bg-muted-foreground'}`} />Live connection reading</div>
        </div>
      </>}
    </section>

    <section className="enter-late grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
      <div>
        <SectionTitle kicker="Recent signals" title="Activity" copy="The latest connection and playback events reported by the bot." />
        {activity.isLoading ? <div className="panel space-y-5 rounded-2xl p-6">{[1, 2, 3].map(i => <div key={i} className="flex gap-3"><Skeleton className="size-8 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="mt-2 h-3 w-24" /></div></div>)}</div>
          : activity.isError ? <QueryError retry={() => activity.refetch()} label="recent activity" />
          : !activity.data?.length ? <div className="panel flex min-h-[210px] flex-col items-center justify-center rounded-2xl px-6 text-center" data-testid="empty-activity">
            <div className="mb-3 grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Radio size={19} /></div>
            <p className="text-sm font-semibold">No activity yet</p><p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">When the bot reports connection or playback events, they’ll appear here.</p>
          </div> : <div className="panel divide-y divide-border rounded-2xl px-5" data-testid="list-activity">
            {activity.data.map((item) => {
              const Icon = item.kind === 'warning' ? CircleAlert : item.kind === 'playback' ? AudioLines : Wifi;
              const tone = item.kind === 'warning' ? 'text-amber-700 bg-amber-500/10' : item.kind === 'playback' ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-muted';
              return <div key={item.id} className="flex gap-3.5 py-4" data-testid={`activity-item-${item.id}`}>
                <div className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${tone}`}><Icon size={15} /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed">{item.message}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock3 size={11} />{timeAgo(item.createdAt)}</p>
                </div>
                <span className="eyebrow mt-1 text-[9px] text-muted-foreground">{item.kind}</span>
              </div>;
            })}
          </div>}
      </div>
      <div>
        <SectionTitle kicker="Available in Discord" title="Supported commands" copy="Join a voice channel, then use a direct audio-stream URL with /play in a server text channel." action={<Link href="/setup" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline" data-testid="link-commands-setup">Setup guide <ArrowRight size={13} /></Link>} />
        {commands.isLoading ? <div className="space-y-3">{[1, 2].map(i => <div key={i} className="panel rounded-2xl p-5"><Skeleton className="h-5 w-28" /><Skeleton className="mt-3 h-3 w-3/4" /></div>)}</div>
          : commands.isError ? <QueryError retry={() => commands.refetch()} label="commands" />
          : !commands.data?.length ? <div className="panel flex min-h-[210px] flex-col items-center justify-center rounded-2xl px-6 text-center" data-testid="empty-commands">
            <div className="mb-3 grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Command size={18} /></div>
            <p className="text-sm font-semibold">Commands unavailable</p><p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">Supported slash commands will show here when the service publishes them.</p>
          </div> : <div className="space-y-3" data-testid="list-commands">
            {commands.data.map((command) => <article key={command.name} className="panel rounded-2xl p-5 transition-transform hover:-translate-y-0.5" data-testid={`command-${command.name}`}>
              <div className="flex items-start justify-between gap-4">
                <div><div className="inline-flex items-center gap-2 rounded-md bg-secondary px-2 py-1 font-mono text-xs font-medium text-secondary-foreground"><span className="text-primary">/</span>{command.name}</div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{command.description}</p></div>
                <ChevronRight size={16} className="mt-1 shrink-0 text-muted-foreground/60" />
              </div>
              <div className="mt-4 rounded-lg bg-muted/70 px-3 py-2 font-mono text-[11px] leading-relaxed text-foreground/80">{command.usage}</div>
            </article>)}
          </div>}
      </div>
    </section>

    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
      <span>Read-only status dashboard · Playback controls live in Discord</span>
      <Link href="/setup" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline" data-testid="link-footer-setup">How to get started <ArrowRight size={13} /></Link>
    </div>
  </div>;
}

function Setup() {
  const status = useGetMusicBotStatus({ query: { queryKey: getGetMusicBotStatusQueryKey(), refetchInterval: 30000 } });
  const state = statePresentation(status.data?.state);
  const checks = [
    { icon: Check, title: 'A Discord server', copy: 'You need permission to manage the server and add applications.' },
    { icon: Check, title: 'Invite the music bot', copy: 'Add the bot to your server and allow it to connect to voice channels.' },
    { icon: Check, title: 'Use a direct audio stream URL', copy: 'The play command expects a URL that points directly to an audio stream.' },
  ];
  return <div className="space-y-10">
    <section className="enter relative overflow-hidden rounded-[26px] bg-[hsl(var(--sidebar))] px-6 py-9 text-white md:px-10 md:py-12">
      <div className="absolute right-[-42px] top-[-92px] size-[290px] rounded-full border border-white/[.08]" />
      <div className="absolute right-[28px] top-[-26px] size-[160px] rounded-full border border-white/[.08]" />
      <div className="relative max-w-2xl">
        <div className="eyebrow mb-4 flex items-center gap-2 text-[hsl(var(--sidebar-primary))]"><LifeBuoy size={13} /> Getting started</div>
        <h1 className="font-display text-[37px] font-semibold leading-[1.05] tracking-[-.065em] md:text-[50px]">Set the room.<br />Let the music happen.</h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65 md:text-[15px]">A short setup in Discord is all it takes. Once the bot is invited, your community can start a shared listening session with slash commands.</p>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--sidebar-primary))] px-4 py-3 text-sm font-semibold text-[hsl(var(--sidebar-primary-foreground))] transition-transform hover:-translate-y-0.5" data-testid="link-setup-status">View live status <ArrowRight size={15} /></Link>
      </div>
      <div className="absolute bottom-8 right-9 hidden items-center gap-3 text-white/45 lg:flex">
        <Waves size={35} strokeWidth={1.2} /><span className="eyebrow">Voice · signal · shared</span>
      </div>
    </section>

    <section className="enter-delay grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
      <div>
        <SectionTitle kicker="Before you begin" title="Three things to have ready" copy="No dashboard controls to configure. Setup and playback happen in your Discord server." />
        <div className="space-y-3">
          {checks.map((check, index) => <div key={check.title} className="panel flex gap-4 rounded-2xl p-5 md:p-6" data-testid={`setup-requirement-${index + 1}`}>
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><check.icon size={17} /></div>
            <div><div className="eyebrow mb-1.5 text-muted-foreground">0{index + 1} / Requirement</div><h3 className="font-display text-base font-semibold tracking-[-.025em]">{check.title}</h3><p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted-foreground">{check.copy}</p></div>
          </div>)}
        </div>
      </div>
      <div>
        <SectionTitle kicker="Run it in Discord" title="A simple listening flow" copy="Use the bot’s slash commands in a server text channel." />
        <div className="panel overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <span className="size-2 rounded-full bg-rose-400/70" /><span className="size-2 rounded-full bg-amber-400/70" /><span className="size-2 rounded-full bg-primary/70" />
            <span className="ml-2 font-mono text-[10px] text-muted-foreground">discord / #music</span>
          </div>
          <div className="space-y-4 p-5">
            <div className="flex gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground"><Command size={15} /></div><div className="min-w-0"><p className="text-xs text-muted-foreground">Choose a supported slash command</p><div className="mt-1.5 inline-flex rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs"><span className="mr-1 text-primary">/</span>play</div></div></div>
            <div className="ml-4 h-5 border-l border-dashed border-border" />
            <div className="flex gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Link2 size={15} /></div><div className="min-w-0"><p className="text-xs text-muted-foreground">Provide a direct audio-stream URL</p><div className="mt-1.5 truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground">https://your-audio-stream.example/stream.mp3</div></div></div>
            <div className="ml-4 h-5 border-l border-dashed border-border" />
            <div className="flex gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Headphones size={15} /></div><div><p className="text-xs text-muted-foreground">The bot joins your voice channel</p><p className="mt-1 text-sm font-medium">Listen together in Discord</p></div></div>
          </div>
          <div className="border-t border-border bg-muted/40 px-5 py-3 text-[11px] leading-relaxed text-muted-foreground">Exact command names and usage are listed on the <Link href="/" className="font-semibold text-primary hover:underline" data-testid="link-setup-commands">overview page</Link>.</div>
        </div>
      </div>
    </section>

    <section className="enter-late grid gap-4 md:grid-cols-[1.3fr_.7fr]">
      <div className="panel flex items-start gap-4 rounded-2xl p-5 md:p-6">
        <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${state.bg} ${state.color}`}><state.icon size={19} /></div>
        <div className="min-w-0 flex-1"><div className="eyebrow mb-1.5 text-muted-foreground">Current connection</div>
          {status.isLoading ? <Skeleton className="h-5 w-28" /> : status.isError ? <div className="flex items-center gap-2 text-sm font-semibold text-destructive">Status unavailable <button className="text-primary hover:underline" onClick={() => status.refetch()} data-testid="button-retry-setup-status">Retry</button></div> : <p className="font-display text-lg font-semibold tracking-[-.03em]" data-testid="status-setup-bot">{status.data?.botName || 'Music bot'} · {state.label}</p>}
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{status.data?.detail || state.message}</p>
        </div>
        <Link href="/" className="hidden items-center gap-1.5 text-xs font-semibold text-primary hover:underline sm:inline-flex" data-testid="link-setup-overview">Full status <ArrowRight size={13} /></Link>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-accent/50 px-5 py-4">
        <ShieldCheck size={20} className="shrink-0 text-accent-foreground" />
        <p className="text-xs leading-relaxed text-accent-foreground">This page is informational only. Run commands in Discord; the dashboard cannot control playback.</p>
      </div>
    </section>
  </div>;
}

function Router() {
  return <RoutedErrorBoundary><Switch>
    <Route path="/"><Shell page="overview"><Overview /></Shell></Route>
    <Route path="/setup"><Shell page="setup"><Setup /></Shell></Route>
    <Route component={NotFound} />
  </Switch></RoutedErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>;
}

export default App;
