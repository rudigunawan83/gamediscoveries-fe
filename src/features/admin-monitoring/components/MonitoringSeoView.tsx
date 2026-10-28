"use client";

import { useState, type ReactNode } from "react";
import {
  ExternalLink,
  Eye,
  FileText,
  ListOrdered,
  MousePointerClick,
  Percent,
  Search,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import {
  ChartLegend,
  Donut,
  LineChart,
  Sparkline,
  StackedBarChart,
} from "@/features/admin-monitoring/components/MonitoringCharts";
import {
  Change,
  Empty,
  MonitoringFrame,
  Panel,
  UnavailablePanel,
  previousLabel,
} from "@/features/admin-monitoring/components/MonitoringUi";
import { formatAgo, formatCompact, formatShare, sourceLabels } from "@/features/admin-monitoring/monitoringFormat";
import {
  getMonitoringSeo,
  getMonitoringTraffic,
  type MonitoringCount,
  type MonitoringQuery,
  type MonitoringRange,
  type MonitoringRatio,
  type MonitoringSeo,
  type SeoIssue,
  type SeoMetricRow,
  type SeoSearchPerformance,
  type SeoSitemap,
  type SeoVital,
  type TrafficShare,
} from "@/lib/api/monitoring";
import type { ApiResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type SeoPageData = MonitoringSeo & { sources: TrafficShare[] | null };

const metricColors = { clicks: "#f5c542", impressions: "#5b8def", ctr: "#3dd68c", position: "#b57bff" };
const rankingColors = { top3: "#3dd68c", top10: "#5b8def", top50: "#b57bff" };

const deviceLabels: Record<string, string> = { desktop: "Desktop", mobile: "Mobile", tablet: "Tablet" };

const vitalInfo: Record<SeoVital["metric"], { label: string; name: string; format: (value: number) => string }> = {
  lcp: { label: "LCP", name: "Largest Contentful Paint", format: (value) => `${(value / 1000).toFixed(1)} s` },
  inp: { label: "INP", name: "Interaction to Next Paint", format: (value) => `${Math.round(value)} ms` },
  cls: { label: "CLS", name: "Cumulative Layout Shift", format: (value) => value.toFixed(2) },
};

const ratingStyles: Record<NonNullable<SeoVital["rating"]>, { label: string; text: string; bar: string }> = {
  good: { label: "Good", text: "text-[#3dd68c]", bar: "bg-[#3dd68c]" },
  needs_improvement: { label: "Needs improvement", text: "text-[#f5c542]", bar: "bg-[#f5c542]" },
  poor: { label: "Poor", text: "text-[#ff6b6b]", bar: "bg-[#ff6b6b]" },
};

const severityStyles: Record<SeoIssue["severity"], string> = {
  high: "border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]",
  medium: "border-[#f5c542]/40 bg-[#f5c542]/10 text-[#f5c542]",
  low: "border-[#5b8def]/40 bg-[#5b8def]/10 text-[#8fb0ff]",
};

const issueLabels: Record<string, string> = {
  sitemap_errors: "Sitemap errors",
  sitemap_warnings: "Sitemap warnings",
  sitemap_not_read: "Sitemap not read",
  low_ctr: "Low CTR",
  striking_distance: "Ranking opportunity",
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryName(code: string) {
  if (code === "ZZZ") return "Unknown region";
  if (code.length !== 2) return code;
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function pagePath(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}` || "/";
  } catch {
    return url;
  }
}

function formatCtr(value: number | null) {
  return value == null ? "—" : `${value.toFixed(1)}%`;
}

function formatPosition(value: number | null) {
  return value == null ? "—" : value.toFixed(1);
}

function consoleUrl(siteUrl: string, report: "performance/search-analytics" | "index" | "sitemaps") {
  return `https://search.google.com/search-console/${report}?resource_id=${encodeURIComponent(siteUrl)}`;
}

async function loadSeo(selection: MonitoringQuery, refresh: boolean): Promise<ApiResponse<SeoPageData>> {
  const [seo, traffic] = await Promise.all([
    getMonitoringSeo(selection, refresh),
    getMonitoringTraffic(selection, refresh).catch(() => null),
  ]);
  return { ...seo, data: { ...seo.data!, sources: traffic?.data?.sources ?? null } };
}

export function MonitoringSeoView() {
  return (
    <MonitoringFrame
      queryName="seo"
      path="/admin/monitoring/seo"
      title="SEO Monitoring"
      description="Google Search performance, sitemaps, and Core Web Vitals for GameDiscoveries."
      icon={Search}
      load={loadSeo}
    >
      {(data, range) => <SeoData data={data} range={range} />}
    </MonitoringFrame>
  );
}

function SeoData({ data, range }: { data: SeoPageData; range: MonitoringRange }) {
  const sitemaps = data.sitemaps ?? [];
  const submitted = sitemaps.reduce((sum, sitemap) => sum + sitemap.submitted, 0);
  const sitemapErrors = sitemaps.reduce((sum, sitemap) => sum + sitemap.errors, 0);
  const search = data.search;

  return (
    <>
      {search ? (
        <SearchKpis search={search} range={range} submitted={data.sitemaps ? submitted : null} errors={data.sitemaps ? sitemapErrors : null} />
      ) : (
        <UnavailablePanel
          title="Google Search performance"
          metric={data.searchUnavailable ?? { reason: "Search Console data is unavailable." }}
          action={<ConsoleLink href={consoleUrl(data.siteUrl, "performance/search-analytics")}>Open Search Console</ConsoleLink>}
        />
      )}

      {search ? (
        <section className="grid gap-3 xl:grid-cols-5">
          <SearchPerformancePanel search={search} className="xl:col-span-3" />
          <Panel
            title="Keyword Rankings"
            subtitle="Queries per day by average position"
            className="xl:col-span-2"
            action={
              <ChartLegend
                series={[
                  { label: "Top 3", color: rankingColors.top3 },
                  { label: "4–10", color: rankingColors.top10 },
                  { label: "11–50", color: rankingColors.top50 },
                ]}
              />
            }
          >
            {search.rankings.every((point) => point.top3 + point.top10 + point.top50 === 0) ? (
              <Empty text="No ranked queries in this range." />
            ) : (
              <StackedBarChart
                buckets={search.rankings.map((point) => point.bucket)}
                hourly={false}
                label="Ranked queries per day by position bucket"
                series={[
                  { label: "Top 3", color: rankingColors.top3, values: search.rankings.map((point) => point.top3) },
                  { label: "4–10", color: rankingColors.top10, values: search.rankings.map((point) => point.top10) },
                  { label: "11–50", color: rankingColors.top50, values: search.rankings.map((point) => point.top50) },
                ]}
              />
            )}
          </Panel>
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Panel title="Traffic by Source" subtitle="Website visits from first-party analytics">
          <SourcesDonut sources={data.sources} />
        </Panel>
        <Panel title="Search Clicks by Device" subtitle="Google Search clicks">
          {search && search.devices.some((row) => row.clicks > 0) ? (
            <Donut
              shares={search.devices.map((row) => ({ key: row.key, sessions: row.clicks }))}
              label={(key) => deviceLabels[key] ?? key}
              centerLabel="Clicks"
            />
          ) : (
            <Empty text={search ? "No clicks in this range." : "Needs Search Console."} />
          )}
        </Panel>
        <UnavailablePanel
          title="Indexed Pages Status"
          metric={data.indexCoverage}
          action={<ConsoleLink href={consoleUrl(data.siteUrl, "index")}>Open report</ConsoleLink>}
        />
      </section>

      {search ? (
        <section className="grid gap-3 xl:grid-cols-3">
          <Panel
            title="Top Landing Pages"
            subtitle="Organic search"
            action={<ConsoleLink href={consoleUrl(data.siteUrl, "performance/search-analytics")}>View all</ConsoleLink>}
          >
            <MetricTable label="Page" rows={search.pages} format={pagePath} empty="No pages with impressions." />
          </Panel>
          <Panel
            title="Top Search Queries"
            action={<ConsoleLink href={consoleUrl(data.siteUrl, "performance/search-analytics")}>View all</ConsoleLink>}
          >
            <MetricTable label="Query" rows={search.queries} format={(key) => key} empty="No queries with impressions." />
          </Panel>
          <Panel title="Top Countries" subtitle="Organic traffic">
            <MetricTable
              label="Country"
              rows={search.countries}
              format={countryName}
              empty="No countries with impressions."
              showPosition={false}
            />
          </Panel>
        </section>
      ) : null}

      <section className="grid gap-3 xl:grid-cols-3">
        <CoreWebVitalsPanel data={data} />
        <SitemapPanel data={data} />
        <IssuesPanel issues={data.issues} hasSearch={Boolean(search)} />
      </section>

      <p className="text-xs text-[#8b8ca3]">
        Search Console days are in Pacific Time and end yesterday; the most recent days are preliminary and can still
        change. Generated {new Date(data.generatedAt).toLocaleString("en")}. Cached for about 30 minutes. Refresh
        bypasses the cache.
      </p>
    </>
  );
}

function SearchKpis({
  search,
  range,
  submitted,
  errors,
}: {
  search: SeoSearchPerformance;
  range: MonitoringRange;
  submitted: number | null;
  errors: number | null;
}) {
  const vs = previousLabel(range);
  const trend = search.trend;
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      <KpiCard
        label="Organic Clicks"
        icon={MousePointerClick}
        value={search.clicks.value.toLocaleString("en")}
        change={search.clicks}
        hint={vs}
        trend={trend.map((point) => point.clicks)}
        color={metricColors.clicks}
      />
      <KpiCard
        label="Organic Impressions"
        icon={Eye}
        value={search.impressions.value.toLocaleString("en")}
        change={search.impressions}
        hint={vs}
        trend={trend.map((point) => point.impressions)}
        color={metricColors.impressions}
      />
      <KpiCard
        label="Average CTR"
        icon={Percent}
        value={formatCtr(search.ctr.value)}
        change={search.ctr}
        hint={vs}
        trend={trend.map((point) => point.ctr ?? 0)}
        color={metricColors.ctr}
      />
      <KpiCard
        label="Average Position"
        icon={ListOrdered}
        value={formatPosition(search.position.value)}
        change={search.position}
        invert
        hint={`Lower is better · ${vs}`}
        trend={trend.map((point) => point.position ?? 0)}
        color={metricColors.position}
      />
      <KpiCard
        label="Submitted URLs"
        icon={FileText}
        value={submitted == null ? "—" : submitted.toLocaleString("en")}
        hint="URLs in sitemaps read by Google"
      />
      <KpiCard
        label="Sitemap Errors"
        icon={TriangleAlert}
        value={errors == null ? "—" : errors.toLocaleString("en")}
        hint={errors ? "Fix in Search Console → Sitemaps" : "Reported by Google"}
        tone={errors ? "danger" : "default"}
      />
    </section>
  );
}

function KpiCard({
  label,
  icon: Icon,
  value,
  change,
  invert,
  hint,
  trend,
  color = "#f5c542",
  tone = "default",
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  change?: MonitoringCount | MonitoringRatio;
  invert?: boolean;
  hint: string;
  trend?: number[];
  color?: string;
  tone?: "default" | "danger";
}) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border bg-[#12141c] p-4",
        tone === "danger" ? "border-[#ff6b6b]/40" : "border-[#f5c542]/25",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-[#c7c8d6]">{label}</p>
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg border",
            tone === "danger"
              ? "border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]"
              : "border-[#f5c542]/40 bg-[#f5c542]/10 text-[#f5c542]",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-2xl font-black tabular-nums">{value}</p>
        {change ? <Change value={change.changePercent} invert={invert} /> : null}
      </div>
      <div className="mt-auto flex items-end gap-2 pt-2">
        <div className="min-w-0 flex-1">{trend ? <Sparkline values={trend} color={color} /> : null}</div>
        <span className="shrink-0 text-[10px] text-[#8b8ca3]">{hint}</span>
      </div>
    </article>
  );
}

type TrendMetric = "clicks" | "impressions" | "ctr" | "position";

const trendMetrics: Array<{ key: TrendMetric; label: string; format?: (value: number) => string }> = [
  { key: "clicks", label: "Clicks" },
  { key: "impressions", label: "Impressions" },
  { key: "ctr", label: "CTR", format: (value) => `${value}%` },
  { key: "position", label: "Position" },
];

function SearchPerformancePanel({ search, className }: { search: SeoSearchPerformance; className?: string }) {
  const [metric, setMetric] = useState<TrendMetric>("clicks");
  const active = trendMetrics.find((item) => item.key === metric) ?? trendMetrics[0];
  const values = search.trend.map((point) => point[metric]);
  const hasData = search.trend.some((point) => point.impressions > 0);

  return (
    <Panel
      title="Search Performance"
      subtitle={metric === "position" ? "Average position per day (lower is better)" : "Google Search, per day"}
      className={className}
      action={
        <div role="group" aria-label="Chart metric" className="flex rounded-lg border border-white/10 bg-[#07080f] p-0.5">
          {trendMetrics.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={metric === item.key}
              onClick={() => setMetric(item.key)}
              className={cn(
                "min-h-8 rounded-md px-2.5 text-xs font-semibold text-[#c7c8d6] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-[#f5c542]",
                metric === item.key && "bg-[#f5c542]/15 text-[#f5c542]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
    >
      {hasData ? (
        <LineChart
          buckets={search.trend.map((point) => point.bucket)}
          hourly={false}
          label={`${active.label} per day`}
          formatValue={active.format ?? formatCompact}
          series={[{ label: active.label, color: metricColors[metric], values }]}
        />
      ) : (
        <Empty text="No Google Search impressions in this range yet." />
      )}
    </Panel>
  );
}

function SourcesDonut({ sources }: { sources: TrafficShare[] | null }) {
  if (!sources) return <Empty text="Traffic sources could not be loaded." />;
  const total = sources.reduce((sum, share) => sum + share.sessions, 0);
  if (total === 0) return <Empty text="No visits in this range." />;
  const organic = sources.find((share) => share.key === "organic_search")?.sessions ?? 0;
  return (
    <Donut
      shares={sources.filter((share) => share.sessions > 0)}
      label={(key) => sourceLabels[key] ?? key}
      centerLabel="Organic share"
      centerValue={formatShare(organic, total)}
    />
  );
}

function MetricTable({
  label,
  rows,
  format,
  empty,
  showPosition = true,
}: {
  label: string;
  rows: SeoMetricRow[];
  format: (key: string) => string;
  empty: string;
  showPosition?: boolean;
}) {
  if (rows.length === 0) return <Empty text={empty} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[22rem] table-fixed text-sm">
        <thead>
          <tr className="text-left text-xs text-[#8b8ca3]">
            <th className="pb-2 font-medium">{label}</th>
            <th className="w-16 pb-2 text-right font-medium">Clicks</th>
            <th className="w-16 pb-2 text-right font-medium">
              <abbr title="Impressions" className="no-underline">Impr.</abbr>
            </th>
            <th className="w-14 pb-2 text-right font-medium">CTR</th>
            {showPosition ? (
              <th className="w-12 pb-2 text-right font-medium">
                <abbr title="Average position" className="no-underline">Pos.</abbr>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const text = format(row.key);
            return (
              <tr key={row.key} className="border-t border-white/5">
                <td className="truncate py-1.5" title={text}>
                  <span className="mr-2 text-[#8b8ca3]">{index + 1}</span>
                  {text}
                </td>
                <td className="py-1.5 text-right tabular-nums">{row.clicks.toLocaleString("en")}</td>
                <td className="py-1.5 text-right tabular-nums text-[#c7c8d6]">{formatCompact(row.impressions)}</td>
                <td className="py-1.5 text-right tabular-nums text-[#3dd68c]">{formatCtr(row.ctr)}</td>
                {showPosition ? (
                  <td className="py-1.5 text-right tabular-nums">{formatPosition(row.position)}</td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CoreWebVitalsPanel({ data }: { data: SeoPageData }) {
  const vitals = data.coreWebVitals;
  if (!vitals) {
    return (
      <UnavailablePanel
        title="Core Web Vitals"
        metric={data.coreWebVitalsUnavailable ?? { reason: "Core Web Vitals are unavailable." }}
      />
    );
  }

  const period =
    vitals.firstDate && vitals.lastDate
      ? `Real Chrome users, ${new Date(vitals.firstDate).toLocaleDateString("en", { month: "short", day: "numeric" })} – ${new Date(vitals.lastDate).toLocaleDateString("en", { month: "short", day: "numeric" })}`
      : "Real Chrome users, last 28 days";

  return (
    <Panel title="Core Web Vitals" subtitle={`${period} · 75th percentile`}>
      <ul className="grid grid-cols-3 gap-2">
        {vitals.metrics.map((vital) => {
          const info = vitalInfo[vital.metric];
          const rating = vital.rating ? ratingStyles[vital.rating] : null;
          return (
            <li key={vital.metric} className="rounded-xl border border-white/10 bg-[#07080f] p-3">
              <p className="text-xs font-bold" title={info.name}>
                <abbr title={info.name} className="no-underline">{info.label}</abbr>
              </p>
              <p className="mt-1 text-lg font-black tabular-nums">{vital.p75 == null ? "—" : info.format(vital.p75)}</p>
              <p className={cn("text-[11px] font-semibold", rating?.text ?? "text-[#8b8ca3]")}>
                {rating?.label ?? "No rating"}
              </p>
              {vital.goodPercent != null ? (
                <>
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
                    role="img"
                    aria-label={`${vital.goodPercent}% of visits are good`}
                  >
                    <span className={cn("block h-full", rating?.bar ?? "bg-[#8b8ca3]")} style={{ width: `${vital.goodPercent}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-[#8b8ca3]">{vital.goodPercent}% good</p>
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function SitemapPanel({ data }: { data: SeoPageData }) {
  const action = <ConsoleLink href={consoleUrl(data.siteUrl, "sitemaps")}>View all</ConsoleLink>;
  if (!data.sitemaps) {
    return (
      <UnavailablePanel
        title="Sitemap Status"
        metric={data.sitemapsUnavailable ?? { reason: "Sitemaps are unavailable." }}
        action={action}
      />
    );
  }

  return (
    <Panel title="Sitemap Status" action={action}>
      {data.sitemaps.length === 0 ? (
        <Empty text="No sitemaps submitted. Submit /sitemap.xml in Search Console." />
      ) : (
        <ul className="space-y-3">
          {data.sitemaps.map((sitemap) => (
            <SitemapItem key={sitemap.path} sitemap={sitemap} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function SitemapItem({ sitemap }: { sitemap: SeoSitemap }) {
  const status = sitemap.errors > 0
    ? { label: "Has errors", className: severityStyles.high }
    : sitemap.isPending || !sitemap.lastDownloaded
      ? { label: "Pending", className: severityStyles.medium }
      : { label: "Success", className: "border-[#3dd68c]/40 bg-[#3dd68c]/10 text-[#3dd68c]" };

  return (
    <li className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <a
          href={sitemap.path}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate font-semibold text-[#8fb0ff] hover:underline"
        >
          {pagePath(sitemap.path)}
          {sitemap.isSitemapsIndex ? <span className="ml-1 text-[#8b8ca3]">(index)</span> : null}
        </a>
        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", status.className)}>
          {status.label}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[#c7c8d6]">
        <dt className="text-[#8b8ca3]">Submitted URLs</dt>
        <dd className="text-right tabular-nums">{sitemap.submitted.toLocaleString("en")}</dd>
        <dt className="text-[#8b8ca3]">Last submitted</dt>
        <dd className="text-right">{sitemap.lastSubmitted ? formatAgo(sitemap.lastSubmitted) : "—"}</dd>
        <dt className="text-[#8b8ca3]">Last read by Google</dt>
        <dd className="text-right">{sitemap.lastDownloaded ? formatAgo(sitemap.lastDownloaded) : "Not yet"}</dd>
        <dt className="text-[#8b8ca3]">Errors / warnings</dt>
        <dd className="text-right tabular-nums">
          {sitemap.errors.toLocaleString("en")} / {sitemap.warnings.toLocaleString("en")}
        </dd>
      </dl>
    </li>
  );
}

function IssuesPanel({ issues, hasSearch }: { issues: SeoIssue[]; hasSearch: boolean }) {
  return (
    <Panel title="SEO Issues & Opportunities" subtitle="From Search Console data">
      {issues.length === 0 ? (
        <Empty text={hasSearch ? "No issues found in this range." : "Needs Search Console."} />
      ) : (
        <ul className="space-y-2">
          {issues.map((issue) => (
            <li key={`${issue.kind}-${issue.target}`} className="rounded-xl border border-white/10 bg-[#07080f] p-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", severityStyles[issue.severity])}>
                  {issueLabels[issue.kind] ?? issue.kind}
                </span>
                <span className="truncate font-semibold" title={issue.target}>
                  {issue.target.startsWith("http") ? pagePath(issue.target) : issue.target}
                </span>
              </div>
              <p className="mt-1 text-[#c7c8d6]">{issue.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function ConsoleLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-semibold text-[#5b8def] hover:underline focus-visible:outline-2 focus-visible:outline-[#5b8def]"
    >
      {children}
      <ExternalLink className="h-3 w-3" aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
