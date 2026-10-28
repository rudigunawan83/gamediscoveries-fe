"use client";

import type { ReactNode } from "react";
import { Clock, Eye, MousePointerClick, TrendingUp, UserCheck, Users } from "lucide-react";
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
  UnavailablePanel,
  previousLabel,
} from "@/features/admin-monitoring/components/MonitoringUi";
import {
  formatDuration,
  formatShare,
  isHourlyMonitoring,
  sourceLabels,
} from "@/features/admin-monitoring/monitoringFormat";
import {
  getMonitoringTraffic,
  type MonitoringRange,
  type MonitoringTraffic,
  type TrafficShare,
} from "@/lib/api/monitoring";

const trendColors = { visitors: "#5b8def", pageViews: "#f5c542" };

const platformLabels: Record<string, string> = {
  web: "Website",
  android: "Android App",
  ios: "iOS App",
  app: "Mobile App",
};

const deviceLabels: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
  unknown: "Unknown",
};

export function MonitoringTrafficView() {
  return (
    <MonitoringFrame
      queryName="traffic"
      path="/admin/monitoring/traffic"
      title="Traffic & Growth"
      description="Website and mobile app visits from analytics events and sessions. Missing sources stay unavailable."
      icon={TrendingUp}
      load={getMonitoringTraffic}
    >
      {(data, range) => <TrafficData data={data} range={range} />}
    </MonitoringFrame>
  );
}

function ShareDonut({
  shares,
  label,
}: {
  shares: TrafficShare[];
  label: (key: string) => string;
}) {
  const total = shares.reduce((sum, share) => sum + share.sessions, 0);
  if (total === 0) return <Empty text="No sessions in this range." />;
  return <Donut shares={shares} label={label} centerLabel="Total Visits" />;
}

function TrafficData({ data, range }: { data: MonitoringTraffic; range: MonitoringRange }) {
  const { newVisitors, returningVisitors } = data.newVsReturning;
  const mixTotal = newVisitors + returningVisitors;
  const vs = previousLabel(range);
  const visitorTrend = data.trend.map((point) => point.visitors);
  const pageViewTrend = data.trend.map((point) => point.pageViews);

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <CountCard label="Total Visits" hint={vs} icon={MousePointerClick} metric={data.visits} />
        <CountCard
          label="Page Views"
          hint={vs}
          icon={Eye}
          metric={data.pageViews}
          trend={pageViewTrend}
        />
        <CountCard
          label="Unique Visitors"
          hint={vs}
          icon={Users}
          metric={data.uniqueVisitors}
          trend={visitorTrend}
          color={trendColors.visitors}
        />
        <article className="rounded-2xl border border-[#f5c542]/25 bg-[#12141c] p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-[#c7c8d6]">Avg. Session Duration</p>
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#f5c542]/40 bg-[#f5c542]/10 text-[#f5c542]">
              <Clock className="h-5 w-5" aria-hidden />
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-black tabular-nums">
              {formatDuration(data.averageSessionDuration.seconds) ?? "—"}
            </p>
            <Change value={data.averageSessionDuration.changePercent} />
          </div>
          <p className="mt-2 text-[10px] text-[#8b8ca3]">
            {data.averageSessionDuration.seconds == null ? "No sessions in range" : `First to last event · ${vs}`}
          </p>
        </article>
        <article className="rounded-2xl border border-[#f5c542]/25 bg-[#12141c] p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-[#c7c8d6]">New vs Returning</p>
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#f5c542]/40 bg-[#f5c542]/10 text-[#f5c542]">
              <UserCheck className="h-5 w-5" aria-hidden />
            </span>
          </div>
          {mixTotal === 0 ? (
            <p className="mt-2 text-3xl font-black">—</p>
          ) : (
            <>
              <p className="mt-2 text-xl font-black tabular-nums">
                <span className="text-[#5b8def]">{formatShare(newVisitors, mixTotal)}</span>
                <span className="text-[#8b8ca3]"> / </span>
                <span className="text-[#3dd68c]">{formatShare(returningVisitors, mixTotal)}</span>
              </p>
              <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-[#07080f]">
                <span className="bg-[#5b8def]" style={{ width: `${(newVisitors / mixTotal) * 100}%` }} />
                <span className="bg-[#3dd68c]" style={{ width: `${(returningVisitors / mixTotal) * 100}%` }} />
              </div>
            </>
          )}
          <p className="mt-2 text-xs text-[#8b8ca3]">
            {newVisitors.toLocaleString("en")} new · {returningVisitors.toLocaleString("en")} returning
          </p>
        </article>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel
          title="Visitors Trend"
          subtitle="Unique visitors and page views over time"
          className="xl:col-span-2"
          action={
            <ChartLegend
              series={[
                { label: "Visitors", color: trendColors.visitors },
                { label: "Page Views", color: trendColors.pageViews },
              ]}
            />
          }
        >
          {data.trend.length === 0 ? (
            <Empty text="No analytics events in this range." />
          ) : (
            <LineChart
              buckets={data.trend.map((point) => point.bucket)}
              hourly={isHourlyMonitoring(data)}
              label="Visitors and page views over time"
              series={[
                { label: "Page Views", color: trendColors.pageViews, values: pageViewTrend },
                { label: "Visitors", color: trendColors.visitors, values: visitorTrend },
              ]}
            />
          )}
        </Panel>
        <Panel title="Traffic Sources" subtitle="Visits by source">
          <ShareDonut shares={data.sources} label={(key) => sourceLabels[key] ?? key} />
        </Panel>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="Visitors by Platform" subtitle="Website and mobile app">
          <ShareDonut shares={data.platforms} label={(key) => platformLabels[key] ?? key} />
        </Panel>
        <UnavailablePanel title="Visitors by Country" metric={data.countries} />
        <Panel title="Visitors by Device">
          <ShareDonut shares={data.devices} label={(key) => deviceLabels[key] ?? key} />
        </Panel>
        <Panel title="Visitors by Browser">
          <ShareDonut shares={data.browsers} label={(key) => key} />
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel title="Top Landing Pages">
          {data.landingPages.length === 0 ? (
            <Empty text="No page views in this range." />
          ) : (
            <RankTable
              headers={["Page", "Sessions", "Change"]}
              rows={data.landingPages.map((page) => ({
                key: page.path,
                label: page.path,
                value: page.count.toLocaleString("en"),
                extra: <Change value={page.changePercent} />,
              }))}
            />
          )}
        </Panel>
        <Panel title="Top Exit Pages">
          {data.exitPages.length === 0 ? (
            <Empty text="No page views in this range." />
          ) : (
            <RankTable
              headers={["Page", "Exits", "Exit rate"]}
              rows={data.exitPages.map((page) => ({
                key: page.path,
                label: page.path,
                value: page.exits.toLocaleString("en"),
                extra: (
                  <span className="text-xs text-[#c7c8d6]">
                    {page.exitRate == null ? "—" : `${page.exitRate.toFixed(1)}%`}
                  </span>
                ),
              }))}
            />
          )}
        </Panel>
        <Panel title="Trending Search Keywords">
          {data.searchKeywords.length === 0 ? (
            <Empty text="No searches in this range." />
          ) : (
            <RankTable
              headers={["Keyword", "Searches", "Change"]}
              rows={data.searchKeywords.map((keyword) => ({
                key: keyword.keyword,
                label: keyword.keyword,
                value: keyword.searches.toLocaleString("en"),
                extra: <Change value={keyword.changePercent} />,
              }))}
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

function RankTable({
  headers,
  rows,
}: {
  headers: [string, string, string];
  rows: Array<{ key: string; label: string; value: string; extra: ReactNode }>;
}) {
  return (
    <table className="w-full table-fixed text-sm">
      <thead>
        <tr className="text-left text-xs text-[#8b8ca3]">
          <th className="pb-2 font-medium">{headers[0]}</th>
          <th className="w-20 pb-2 text-right font-medium">{headers[1]}</th>
          <th className="w-20 pb-2 text-right font-medium">{headers[2]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.key} className="border-t border-white/5">
            <td className="truncate py-1.5" title={row.label}>
              <span className="mr-2 text-[#8b8ca3]">{index + 1}</span>
              {row.label}
            </td>
            <td className="py-1.5 text-right tabular-nums">{row.value}</td>
            <td className="py-1.5 text-right">{row.extra}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
