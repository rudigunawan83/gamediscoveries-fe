"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Gamepad2,
  Layers,
  PlayCircle,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import {
  ChartLegend,
  Donut,
  LabeledBarChart,
  LineChart,
} from "@/features/admin-monitoring/components/MonitoringCharts";
import {
  CountCard,
  DurationCard,
  Empty,
  MonitoringFrame,
  Panel,
  previousLabel,
} from "@/features/admin-monitoring/components/MonitoringUi";
import { formatDuration } from "@/features/admin-monitoring/monitoringFormat";
import {
  getMonitoringGames,
  type GameLaunchFunnel,
  type MonitoringGames,
  type MonitoringRange,
} from "@/lib/api/monitoring";

const trendColors = { plays: "#f5c542", players: "#5b8def", playtime: "#b57bff" };

const playtimeLabels: Record<string, string> = {
  lt_1m: "< 1 min",
  "1_5m": "1–5 min",
  "5_10m": "5–10 min",
  "10_30m": "10–30 min",
  "30_60m": "30–60 min",
  gt_60m: "> 60 min",
};

const playerLabels: Record<string, string> = {
  new: "New Players",
  returning: "Returning Players",
};

const formatSeconds = (value: number) => formatDuration(value) ?? "0s";

export function MonitoringGamesView() {
  return (
    <MonitoringFrame
      queryName="games"
      path="/admin/monitoring/games"
      title="Game Analytics"
      description="Game performance and player engagement from play sessions. Missing sources stay unavailable."
      icon={Gamepad2}
      load={getMonitoringGames}
    >
      {(data, range) => <GamesData data={data} range={range} />}
    </MonitoringFrame>
  );
}

function GamesData({ data, range }: { data: MonitoringGames; range: MonitoringRange }) {
  const hourly = data.range === "24h";
  const vs = previousLabel(range);
  const buckets = data.trend.map((point) => point.bucket);
  const plays = data.trend.map((point) => point.plays);
  const players = data.trend.map((point) => point.uniquePlayers);
  const playtime = data.trend.map((point) => point.averagePlaytimeSeconds ?? 0);
  const hasPlays = plays.some((value) => value > 0);
  const hasPlaytime = data.trend.some((point) => point.averagePlaytimeSeconds != null);
  const finishedSessions = data.playtimeDistribution.reduce((sum, bucket) => sum + bucket.sessions, 0);
  const { newPlayers, returningPlayers } = data.newVsReturning;
  const topCategoryPlays = Math.max(0, ...data.categories.map((category) => category.plays));
  const launch = data.launch;

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <CountCard label="Total Games" hint={vs} icon={Gamepad2} metric={data.totalGames} />
        <CountCard label="Total Plays" hint={vs} icon={PlayCircle} metric={data.totalPlays} trend={plays} />
        <DurationCard
          label="Avg. Playtime"
          hint={vs}
          icon={Clock}
          metric={data.averagePlaytime}
          trend={hasPlaytime ? playtime : undefined}
          color={trendColors.playtime}
        />
        <StatCard
          label="Load Success Rate"
          icon={Rocket}
          value={launch.loadSuccessRate == null ? "—" : `${launch.loadSuccessRate}%`}
          hint={`${(launch.loaded + launch.loadFailed).toLocaleString("en")} reported loads`}
        />
        <StatCard
          label="Failed Loads"
          icon={AlertTriangle}
          value={launch.loadFailed.toLocaleString("en")}
          hint="Load errors and timeouts"
        />
        <CountCard label="Active Games" hint={vs} icon={Layers} metric={data.activeGames} />
      </section>

      <section className="grid gap-3 xl:grid-cols-5">
        <Panel
          title="Game Plays Trend"
          subtitle="Plays and unique players, including guests"
          className="xl:col-span-3"
          action={
            <ChartLegend
              series={[
                { label: "Total Plays", color: trendColors.plays },
                { label: "Unique Players", color: trendColors.players },
              ]}
            />
          }
        >
          {hasPlays ? (
            <LineChart
              buckets={buckets}
              hourly={hourly}
              label="Game plays and unique players over time"
              series={[
                { label: "Total Plays", color: trendColors.plays, values: plays },
                { label: "Unique Players", color: trendColors.players, values: players },
              ]}
            />
          ) : (
            <Empty text="No play sessions in this range." />
          )}
        </Panel>
        <Panel
          title="Playtime Distribution"
          subtitle="Finished sessions by active playtime"
          className="xl:col-span-2"
        >
          {finishedSessions > 0 ? (
            <LabeledBarChart
              label="Finished sessions by playtime"
              items={data.playtimeDistribution.map((bucket) => ({
                key: bucket.key,
                label: playtimeLabels[bucket.key] ?? bucket.key,
                value: bucket.sessions,
              }))}
            />
          ) : (
            <Empty text="No finished sessions in this range." />
          )}
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel title="Top Games by Plays">
          {data.topGames.length === 0 ? (
            <Empty text="No games were played in this range." />
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8b8ca3]">
                  <th className="w-6 pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Game</th>
                  <th className="w-14 pb-2 text-right font-medium">Plays</th>
                  <th className="w-16 pb-2 text-right font-medium">Players</th>
                  <th className="w-16 pb-2 text-right font-medium">Avg. Time</th>
                </tr>
              </thead>
              <tbody>
                {data.topGames.map((game, index) => (
                  <tr key={game.slug} className="border-t border-white/5">
                    <td className="py-2 text-[#8b8ca3]">{index + 1}</td>
                    <td className="py-2">
                      <Link href={`/game/${game.slug}`} className="flex min-w-0 items-center gap-2 hover:underline">
                        {game.thumbnailUrl ? (
                          <Image
                            src={game.thumbnailUrl}
                            alt=""
                            width={32}
                            height={32}
                            className="h-8 w-8 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/5">
                            <Gamepad2 className="h-4 w-4 text-[#8b8ca3]" aria-hidden />
                          </span>
                        )}
                        <span className="truncate font-semibold">{game.title}</span>
                      </Link>
                    </td>
                    <td className="py-2 text-right tabular-nums">{game.plays.toLocaleString("en")}</td>
                    <td className="py-2 text-right tabular-nums">{game.uniquePlayers.toLocaleString("en")}</td>
                    <td className="py-2 text-right tabular-nums text-[#c7c8d6]">
                      {formatDuration(game.averagePlaytimeSeconds) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel title="Launch Funnel" subtitle="Detail view to valid play session">
          <LaunchFunnelSteps launch={launch} />
        </Panel>
        <Panel title="Games by Category" subtitle="Plays per category; a game can be in several">
          {data.categories.length === 0 || topCategoryPlays === 0 ? (
            <Empty text="No categorized plays in this range." />
          ) : (
            <ul className="space-y-2.5">
              {data.categories.map((category) => (
                <li key={category.name} className="grid grid-cols-[6rem_1fr_4rem] items-center gap-3 text-sm">
                  <span className="truncate" title={category.name}>
                    {category.name}
                  </span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-[#07080f]">
                    <span
                      className="block h-full rounded-full bg-[#f5c542]"
                      style={{ width: `${(category.plays / topCategoryPlays) * 100}%` }}
                    />
                  </span>
                  <span className="text-right tabular-nums text-[#c7c8d6]">{category.plays.toLocaleString("en")}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel title="Average Playtime Trend" subtitle="Active playtime of finished sessions">
          {hasPlaytime ? (
            <LineChart
              buckets={buckets}
              hourly={hourly}
              label="Average playtime over time"
              formatValue={formatSeconds}
              series={[{ label: "Avg. Playtime", color: trendColors.playtime, values: playtime }]}
            />
          ) : (
            <Empty text="No finished sessions in this range." />
          )}
        </Panel>
        <Panel title="Games with Highest Failure Rate" subtitle="Failed loads out of reported loads">
          {launch.failingGames.length === 0 ? (
            <Empty text="No failed loads in this range." />
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8b8ca3]">
                  <th className="pb-2 font-medium">Game</th>
                  <th className="w-16 pb-2 text-right font-medium">Failed</th>
                  <th className="w-16 pb-2 text-right font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {launch.failingGames.map((game) => (
                  <tr key={game.slug} className="border-t border-white/5">
                    <td className="py-2">
                      <Link href={`/game/${game.slug}`} className="block truncate font-semibold hover:underline">
                        {game.title}
                      </Link>
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {game.failed.toLocaleString("en")}/{game.attempts.toLocaleString("en")}
                    </td>
                    <td className="py-2 text-right tabular-nums text-[#ff6b6b]">
                      {Math.round((game.failed / game.attempts) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel title="New vs Returning Players" subtitle="Returning players played before this range">
          {newPlayers + returningPlayers === 0 ? (
            <Empty text="No players in this range." />
          ) : (
            <Donut
              shares={[
                { key: "new", sessions: newPlayers },
                { key: "returning", sessions: returningPlayers },
              ]}
              label={(key) => playerLabels[key] ?? key}
              centerLabel="Players"
            />
          )}
        </Panel>
      </section>

      <p className="text-xs text-[#8b8ca3]">
        Generated {new Date(data.generatedAt).toLocaleString("en")}. Cached for about 5 minutes. Refresh bypasses the cache.
      </p>
    </>
  );
}

function StatCard({
  label,
  icon,
  value,
  hint,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  hint: string;
}) {
  const Icon = icon;
  return (
    <article className="flex flex-col rounded-2xl border border-[#f5c542]/25 bg-[#12141c] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-[#c7c8d6]">{label}</p>
        <Icon className="h-4 w-4 text-[#f5c542]" aria-hidden />
      </div>
      <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
      <p className="mt-2 text-[10px] text-[#8b8ca3]">{hint}</p>
    </article>
  );
}

function LaunchFunnelSteps({ launch }: { launch: GameLaunchFunnel }) {
  const steps = [
    { label: "Game views", value: launch.views },
    { label: "Play clicks", value: launch.playClicks },
    { label: "Games loaded", value: launch.loaded },
    { label: "Play sessions", value: launch.sessions },
    { label: "Valid sessions", value: launch.validSessions },
  ];
  const top = Math.max(1, ...steps.map((step) => step.value));
  if (steps.every((step) => step.value === 0)) {
    return <Empty text="No launch activity in this range." />;
  }
  return (
    <ul className="space-y-2.5">
      {steps.map((step) => (
        <li key={step.label} className="grid grid-cols-[7rem_1fr_4rem] items-center gap-3 text-sm">
          <span className="truncate">{step.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-[#07080f]">
            <span
              className="block h-full rounded-full bg-[#5b8def]"
              style={{ width: `${(step.value / top) * 100}%` }}
            />
          </span>
          <span className="text-right tabular-nums text-[#c7c8d6]">{step.value.toLocaleString("en")}</span>
        </li>
      ))}
    </ul>
  );
}
