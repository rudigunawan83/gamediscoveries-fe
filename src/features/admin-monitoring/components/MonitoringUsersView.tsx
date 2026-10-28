"use client";

import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Clock,
  FileText,
  Gamepad2,
  Repeat,
  UserPlus,
  Users,
} from "lucide-react";
import {
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
  RatioCard,
  previousLabel,
} from "@/features/admin-monitoring/components/MonitoringUi";
import { formatDuration, isHourlyMonitoring, sourceLabels } from "@/features/admin-monitoring/monitoringFormat";
import {
  getMonitoringUsers,
  type MonitoringRange,
  type MonitoringRatio,
  type MonitoringUsers,
  type UserCohort,
  type UserHeatmapCell,
} from "@/lib/api/monitoring";

const colors = { d1: "#f5c542", d7: "#5b8def", d30: "#b57bff", new: "#f5c542", returning: "#5b8def" };

const distributionLabels: Record<string, string> = {
  new: "New Users",
  returning: "Returning Users",
  lapsed: "Lapsed (not in range, seen < 30 days)",
  inactive: "Inactive (30+ days)",
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const formatAxisPercent = (value: number) => `${value}%`;

function utcDay(iso: string, offsetDays = 0) {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function MonitoringUsersView() {
  return (
    <MonitoringFrame
      queryName="users"
      path="/admin/monitoring/retention"
      title="User & Retention"
      description="User growth, retention, and engagement from website and app activity, including guests."
      icon={Users}
      load={getMonitoringUsers}
    >
      {(data, range) => <UsersData data={data} range={range} />}
    </MonitoringFrame>
  );
}

function UsersData({ data, range }: { data: MonitoringUsers; range: MonitoringRange }) {
  const hourly = isHourlyMonitoring(data);
  const vs = previousLabel(range);
  const buckets = data.activity.map((point) => point.bucket);
  const active = data.activity.map((point) => point.activeUsers);
  const newUsers = data.activity.map((point) => point.newUsers);
  const returning = data.activity.map((point) => point.returningUsers);
  const hasActivity = active.some((value) => value > 0);
  const retentionDays = data.retention.map((point) => point.day);
  const hasRetention = data.retention.some((point) => point.d1 != null || point.d7 != null || point.d30 != null);
  const { distribution } = data;
  const known = distribution.new + distribution.returning + distribution.lapsed + distribution.inactive;

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <CountCard label="DAU" hint="Last 24 hours" icon={Users} metric={data.dau} trend={hasActivity ? active : undefined} />
        <CountCard label="WAU" hint="Last 7 days" icon={CalendarDays} metric={data.wau} />
        <CountCard label="MAU" hint="Last 30 days" icon={CalendarRange} metric={data.mau} />
        <RatioCard
          label="User Retention Rate"
          hint="Active last period and back in this one"
          emptyHint="No users in the previous period"
          icon={Repeat}
          metric={data.retentionRate}
          format={formatPercent}
        />
        <CountCard
          label="New Users"
          hint={vs}
          icon={UserPlus}
          metric={data.newUsers}
          trend={hasActivity ? newUsers : undefined}
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-5">
        <Panel
          title="User Retention Cohort"
          subtitle="Share of users who return in each week after their first visit (weeks start Monday, UTC)"
          className="xl:col-span-3"
        >
          <CohortTable cohorts={data.cohorts} />
        </Panel>
        <Panel
          title="User Retention Rate"
          subtitle="Users first seen 1, 7, and 30 days earlier who were active that day"
          className="xl:col-span-2"
          action={
            <ChartLegend
              series={[
                { label: "D1", color: colors.d1 },
                { label: "D7", color: colors.d7 },
                { label: "D30", color: colors.d30 },
              ]}
            />
          }
        >
          {hasRetention ? (
            <LineChart
              buckets={retentionDays}
              hourly={false}
              label="D1, D7, and D30 retention by day"
              formatValue={formatAxisPercent}
              series={[
                { label: "D1", color: colors.d1, values: data.retention.map((point) => point.d1) },
                { label: "D7", color: colors.d7, values: data.retention.map((point) => point.d7) },
                { label: "D30", color: colors.d30, values: data.retention.map((point) => point.d30) },
              ]}
            />
          ) : (
            <Empty text="Not enough new users yet to measure D1, D7, or D30 retention." />
          )}
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel
          title="New vs Returning Users"
          subtitle="Returning users were first seen before the bucket"
          action={
            <ChartLegend
              series={[
                { label: "New Users", color: colors.new },
                { label: "Returning Users", color: colors.returning },
              ]}
            />
          }
        >
          {hasActivity ? (
            <LineChart
              buckets={buckets}
              hourly={hourly}
              label="New and returning users over time"
              series={[
                { label: "New Users", color: colors.new, values: newUsers },
                { label: "Returning Users", color: colors.returning, values: returning },
              ]}
            />
          ) : (
            <Empty text="No user activity in this range." />
          )}
        </Panel>
        <Panel title="User Engagement" subtitle={`Per active user or session, ${vs}`}>
          <div className="grid grid-cols-2 gap-2">
            <EngagementTile
              label="Games per Player"
              icon={Gamepad2}
              metric={data.engagement.gamesPerPlayer}
              format={(value) => value.toFixed(1)}
            />
            <EngagementTile
              label="Avg. Session Duration"
              icon={Clock}
              metric={{
                value: data.engagement.averageSessionDuration.seconds,
                changePercent: data.engagement.averageSessionDuration.changePercent,
              }}
              format={(value) => formatDuration(value) ?? "—"}
            />
            <EngagementTile
              label="Sessions per User"
              icon={BarChart3}
              metric={data.engagement.sessionsPerUser}
              format={(value) => value.toFixed(1)}
            />
            <EngagementTile
              label="Pages per Session"
              icon={FileText}
              metric={data.engagement.pagesPerSession}
              format={(value) => value.toFixed(1)}
            />
          </div>
        </Panel>
        <Panel title="User Distribution" subtitle="Known users by their last visit">
          {known === 0 ? (
            <Empty text="No users have been seen yet." />
          ) : (
            <Donut
              shares={[
                { key: "new", sessions: distribution.new },
                { key: "returning", sessions: distribution.returning },
                { key: "lapsed", sessions: distribution.lapsed },
                { key: "inactive", sessions: distribution.inactive },
              ]}
              label={(key) => distributionLabels[key] ?? key}
              centerLabel="Known Users"
            />
          )}
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel title="Top Games by Active Users" subtitle="Repeat = played on more than one day">
          {data.topGames.length === 0 ? (
            <Empty text="No games were played in this range." />
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8b8ca3]">
                  <th className="w-6 pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Game</th>
                  <th className="w-16 pb-2 text-right font-medium">Players</th>
                  <th className="w-16 pb-2 text-right font-medium">Repeat</th>
                  <th className="w-16 pb-2 text-right font-medium">Change</th>
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
                    <td className="py-2 text-right tabular-nums">{game.activeUsers.toLocaleString("en")}</td>
                    <td className="py-2 text-right tabular-nums text-[#c7c8d6]">
                      {game.repeatRate == null ? "—" : formatPercent(game.repeatRate)}
                    </td>
                    <td className="py-2 text-right">
                      <Change value={game.changePercent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel title="User Activity Heatmap" subtitle="Active users by weekday and hour (UTC)">
          <Heatmap cells={data.heatmap} />
        </Panel>
        <Panel
          title="Top User Cohorts by Acquisition Source"
          subtitle="New users by first-visit source; back within 7 days needs 8+ days of history"
        >
          {data.acquisition.length === 0 ? (
            <Empty text="No new users in this range." />
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8b8ca3]">
                  <th className="w-6 pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Source</th>
                  <th className="w-16 pb-2 text-right font-medium">Users</th>
                  <th className="w-20 pb-2 text-right font-medium">Back in 7d</th>
                  <th className="w-16 pb-2 text-right font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {data.acquisition.map((cohort, index) => (
                  <tr key={cohort.source} className="border-t border-white/5">
                    <td className="py-2 text-[#8b8ca3]">{index + 1}</td>
                    <td className="truncate py-2 font-semibold">{sourceLabels[cohort.source] ?? cohort.source}</td>
                    <td className="py-2 text-right tabular-nums">{cohort.users.toLocaleString("en")}</td>
                    <td className="py-2 text-right tabular-nums text-[#c7c8d6]">
                      {cohort.returnRate == null ? "—" : formatPercent(cohort.returnRate)}
                    </td>
                    <td className="py-2 text-right">
                      <Change value={cohort.changePercent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </section>

      <p className="text-xs text-[#8b8ca3]">
        Users are devices (guests included) seen on the website or the app. Generated{" "}
        {new Date(data.generatedAt).toLocaleString("en")}. Cached for about 10 minutes. Refresh bypasses the cache.
      </p>
    </>
  );
}

function CohortTable({ cohorts }: { cohorts: UserCohort[] }) {
  if (cohorts.every((cohort) => cohort.users === 0)) {
    return <Empty text="No new users in the last 8 weeks." />;
  }
  const weeks = cohorts[0]?.retention.length ?? 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-separate border-spacing-0.5 text-xs">
        <thead>
          <tr className="text-[#8b8ca3]">
            <th className="pb-1 text-left font-medium">Cohort</th>
            <th className="pb-1 text-right font-medium">Users</th>
            {Array.from({ length: weeks }, (_, week) => (
              <th key={week} className="pb-1 text-center font-medium">
                Week {week}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => (
            <tr key={cohort.weekStart}>
              <td className="whitespace-nowrap pr-2 text-[#c7c8d6]">
                {utcDay(cohort.weekStart)} – {utcDay(cohort.weekStart, 6)}
              </td>
              <td className="pr-2 text-right tabular-nums text-[#c7c8d6]">{cohort.users.toLocaleString("en")}</td>
              {cohort.retention.map((value, week) => (
                <td
                  key={week}
                  className="h-7 rounded-sm text-center tabular-nums"
                  style={
                    value == null
                      ? undefined
                      : {
                          backgroundColor: `rgba(245, 197, 66, ${0.08 + (value / 100) * 0.82})`,
                          color: value >= 45 ? "#07080f" : "#ffffff",
                        }
                  }
                >
                  {value == null ? <span className="text-[#4a4c5e]">—</span> : formatPercent(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Heatmap({ cells }: { cells: UserHeatmapCell[] }) {
  const max = Math.max(0, ...cells.map((cell) => cell.users));
  if (max === 0) return <Empty text="No user activity in this range." />;
  const users = new Map(cells.map((cell) => [`${cell.day}-${cell.hour}`, cell.users]));

  return (
    <div>
      <div className="grid grid-cols-[2rem_repeat(24,minmax(0,1fr))] gap-0.5" role="img" aria-label="Active users by weekday and hour, UTC">
        {weekdays.map((name, dayIndex) => (
          <div key={name} className="contents">
            <span className="text-[10px] leading-4 text-[#8b8ca3]">{name}</span>
            {Array.from({ length: 24 }, (_, hour) => {
              const value = users.get(`${dayIndex + 1}-${hour}`) ?? 0;
              return (
                <span
                  key={hour}
                  className="h-4 rounded-[2px]"
                  title={`${name} ${String(hour).padStart(2, "0")}:00 UTC: ${value.toLocaleString("en")} users`}
                  style={{
                    backgroundColor:
                      value === 0 ? "#1c1f2b" : `rgba(245, 197, 66, ${0.15 + (value / max) * 0.85})`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-[2rem_repeat(24,minmax(0,1fr))] gap-0.5 text-[9px] text-[#8b8ca3]">
        <span />
        {Array.from({ length: 24 }, (_, hour) => (
          <span key={hour} className="text-center">
            {hour % 3 === 0 ? String(hour).padStart(2, "0") : ""}
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-[#8b8ca3]">
        Less
        {[0.15, 0.35, 0.6, 0.8, 1].map((alpha) => (
          <span key={alpha} className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: `rgba(245, 197, 66, ${alpha})` }} />
        ))}
        More
      </div>
    </div>
  );
}

function EngagementTile({
  label,
  icon: Icon,
  metric,
  format,
}: {
  label: string;
  icon: LucideIcon;
  metric: MonitoringRatio;
  format: (value: number) => string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-[#0d0f16] p-3 text-center">
      <p className="text-[11px] text-[#c7c8d6]">{label}</p>
      <Icon className="h-5 w-5 text-[#f5c542]" aria-hidden />
      <p className="text-lg font-black tabular-nums">{metric.value == null ? "—" : format(metric.value)}</p>
      <Change value={metric.changePercent} />
    </div>
  );
}
