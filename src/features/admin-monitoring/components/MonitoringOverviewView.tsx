"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Coins,
  Database,
  Gamepad2,
  Globe,
  Search,
  Server,
  UserPlus,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart,
  ChartLegend,
  Donut,
  LineChart,
} from "@/features/admin-monitoring/components/MonitoringCharts";
import {
  Change,
  CountCard,
  Empty,
  MonitoringFrame,
  Panel,
  PanelLink,
  UnavailableCard,
  UnavailablePanel,
  previousLabel,
} from "@/features/admin-monitoring/components/MonitoringUi";
import { formatAgo } from "@/features/admin-monitoring/monitoringFormat";
import {
  getMonitoringOverview,
  getMonitoringTraffic,
  type MonitoringOverview,
  type MonitoringRange,
} from "@/lib/api/monitoring";
import { cn } from "@/lib/utils";

const activityColors = { dau: "#f5c542", wau: "#5b8def", mau: "#b57bff" };

const sourceLabels: Record<string, string> = {
  organic_search: "Organic Search",
  direct: "Direct",
  social: "Social Media",
  referral: "Referral",
  paid_ads: "Paid Ads",
  mobile_app: "Mobile App",
  others: "Others",
};

const deviceLabels: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
  unknown: "Unknown",
};

const healthIcons: Record<string, LucideIcon> = {
  API: Server,
  Database,
  Cache: Zap,
  Search,
  Website: Globe,
};

export function MonitoringOverviewView() {
  return (
    <MonitoringFrame
      queryName="overview"
      path="/admin/monitoring"
      title="Monitoring Overview"
      description="Real-time insights and system health for GameDiscoveries"
      icon={Gamepad2}
      load={getMonitoringOverview}
    >
      {(data, range) => <OverviewData data={data} range={range} />}
    </MonitoringFrame>
  );
}

function OverviewData({ data, range }: { data: MonitoringOverview; range: MonitoringRange }) {
  const hourly = data.range === "24h";
  const buckets = data.activity.map((point) => point.bucket);
  const hasPlayers = data.activity.some((point) => point.mau > 0);
  const hasPlays = data.activity.some((point) => point.plays > 0);
  const vs = previousLabel(range);

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <CountCard
          label="Active Players"
          hint={vs}
          icon={Users}
          metric={data.activeUsers}
          trend={data.activity.map((point) => point.activeUsers)}
        />
        <CountCard
          label="Total Game Plays"
          hint={vs}
          icon={Gamepad2}
          metric={data.gamePlays}
          trend={data.activity.map((point) => point.plays)}
        />
        <CountCard
          label="New Registered Users"
          hint={vs}
          icon={UserPlus}
          metric={data.newUsers}
          trend={data.activity.map((point) => point.newUsers)}
          color="#4fd1c5"
        />
        <UnavailableCard label="API Success Rate" icon={Server} metric={data.apiSuccessRate} />
        <UnavailableCard label="Avg. Response Time" icon={Zap} metric={data.averageResponseTime} />
        <UnavailableCard label="Est. Ad Revenue" icon={Coins} metric={data.estimatedAdRevenue} />
      </section>

      <section className="grid gap-3 xl:grid-cols-5">
        <Panel
          title="User Activity"
          subtitle="Signed-in players active in the last 1, 7, and 30 days"
          className="xl:col-span-3"
          action={
            <ChartLegend
              series={[
                { label: "DAU", color: activityColors.dau },
                { label: "WAU", color: activityColors.wau },
                { label: "MAU", color: activityColors.mau },
              ]}
            />
          }
        >
          {hasPlayers ? (
            <LineChart
              buckets={buckets}
              hourly={hourly}
              label="Daily, weekly, and monthly active players"
              series={[
                { label: "MAU", color: activityColors.mau, values: data.activity.map((point) => point.mau) },
                { label: "WAU", color: activityColors.wau, values: data.activity.map((point) => point.wau) },
                { label: "DAU", color: activityColors.dau, values: data.activity.map((point) => point.dau) },
              ]}
            />
          ) : (
            <Empty text="No signed-in players in this range." />
          )}
        </Panel>
        <Panel
          title="Game Plays"
          subtitle={hourly ? "Total game plays per hour" : "Total game plays per day"}
          className="xl:col-span-2"
        >
          {hasPlays ? (
            <BarChart
              buckets={buckets}
              hourly={hourly}
              label="Game plays over time"
              values={data.activity.map((point) => point.plays)}
            />
          ) : (
            <Empty text="No play sessions in this range." />
          )}
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel title="Top Games by Plays" action={<PanelLink href="/admin/monitoring/games">View All</PanelLink>}>
          {data.topGames.length === 0 ? (
            <Empty text="No games were played in this range." />
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8b8ca3]">
                  <th className="w-6 pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Game</th>
                  <th className="w-16 pb-2 text-right font-medium">Plays</th>
                  <th className="w-16 pb-2 text-right font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {data.topGames.map((game, index) => (
                  <tr key={game.title} className="border-t border-white/5">
                    <td className="py-2 text-[#8b8ca3]">{index + 1}</td>
                    <td className="py-2">
                      <span className="flex min-w-0 items-center gap-2">
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
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums">{game.plays.toLocaleString("en")}</td>
                    <td className="py-2 text-right">
                      <Change value={game.changePercent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <UnavailablePanel
          title="Recent Errors"
          metric={data.recentErrors}
          action={<PanelLink href="/admin/monitoring/errors">View All</PanelLink>}
        />
        <UnavailablePanel
          title="Recent Alerts"
          metric={data.recentIncidents}
          action={<PanelLink href="/admin/monitoring/alerts">View All</PanelLink>}
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel
          title="Platform Health"
          subtitle="Current status of core services"
          action={<PanelLink href="/admin/monitoring/uptime">View Details</PanelLink>}
        >
          <ul className="max-h-72 space-y-2 overflow-auto pr-1">
            {data.health.map((item) => {
              const Icon = healthIcons[item.name] ?? Server;
              return (
                <li key={item.name} className="flex items-center gap-3 text-sm">
                  <Icon className="h-4 w-4 shrink-0 text-[#c7c8d6]" aria-hidden />
                  <span className="w-20 shrink-0">{item.name}</span>
                  <StatusPill status={item.status} />
                  <span className="min-w-0 flex-1 truncate text-xs text-[#8b8ca3]" title={item.detail ?? undefined}>
                    {item.detail ?? ""}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-[#c7c8d6]">
                    {item.latencyMs == null ? "—" : `${Math.round(item.latencyMs)} ms`}
                  </span>
                </li>
              );
            })}
            {data.providers.map((provider) => (
              <li key={`${provider.source}-${provider.name}`} className="flex items-center gap-3 text-sm">
                <Gamepad2 className="h-4 w-4 shrink-0 text-[#c7c8d6]" aria-hidden />
                <span className="w-20 shrink-0 truncate" title={provider.name}>
                  {provider.name}
                </span>
                <StatusPill status={provider.status ?? "never synced"} />
                <span className="min-w-0 flex-1 truncate text-xs text-[#8b8ca3]">
                  {provider.lastSyncedAt ? `Last sync ${formatAgo(provider.lastSyncedAt)}` : "No sync yet"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <TrafficPanels range={range} />
      </section>

      <p className="text-xs text-[#8b8ca3]">
        Generated {new Date(data.generatedAt).toLocaleString("en")}. Cached for about 90 seconds. Refresh bypasses the cache.
      </p>
    </>
  );
}

function TrafficPanels({ range }: { range: MonitoringRange }) {
  const traffic = useQuery({
    queryKey: ["admin", "monitoring", "traffic", range],
    queryFn: async () => (await getMonitoringTraffic(range)).data,
    staleTime: 60_000,
  });

  const state = traffic.isPending ? (
    <Empty text="Loading traffic…" />
  ) : traffic.isError ? (
    <Empty text="Traffic could not be loaded." />
  ) : null;

  const data = traffic.data;
  const totalSessions = data?.sources.reduce((sum, share) => sum + share.sessions, 0) ?? 0;
  const trafficLink = <PanelLink href="/admin/monitoring/traffic">View Traffic</PanelLink>;

  return (
    <>
      <Panel title="Traffic Sources" subtitle="Website and app visits by source" action={trafficLink}>
        {state ??
          (data && totalSessions > 0 ? (
            <Donut shares={data.sources} label={(key) => sourceLabels[key] ?? key} centerLabel="Total Visits" />
          ) : (
            <Empty text="No visits in this range." />
          ))}
      </Panel>
      <Panel title="Device & Browser" subtitle="Website and app visits by device and browser">
        {state ??
          (data && totalSessions > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold text-[#c7c8d6]">Devices</p>
                <Donut
                  shares={data.devices}
                  label={(key) => deviceLabels[key] ?? key}
                  centerLabel="Total Visits"
                  size="h-24 w-24"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-[#c7c8d6]">Browsers</p>
                <Donut shares={data.browsers} label={(key) => key} centerLabel="Total Visits" size="h-24 w-24" />
              </div>
            </div>
          ) : (
            <Empty text="No visits in this range." />
          ))}
      </Panel>
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const value = status.toLowerCase();
  const tone =
    value === "healthy" || value === "succeeded" || value === "success" || value === "completed"
      ? "border-[#3dd68c]/40 bg-[#3dd68c]/10 text-[#3dd68c]"
      : value === "unavailable" || value === "never synced"
        ? "border-[#f5c542]/40 bg-[#f5c542]/10 text-[#f5c542]"
        : value === "degraded" || value === "running"
          ? "border-[#ff8a5b]/40 bg-[#ff8a5b]/10 text-[#ff8a5b]"
          : "border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]";
  return (
    <span className={cn("shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize", tone)}>
      {status}
    </span>
  );
}
