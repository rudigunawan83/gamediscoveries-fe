"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, RefreshCw, type LucideIcon } from "lucide-react";
import { Sparkline } from "@/features/admin-monitoring/components/MonitoringCharts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  formatChange,
  formatDuration,
  rangeLabel,
} from "@/features/admin-monitoring/monitoringFormat";
import type {
  MonitoringCount,
  MonitoringDuration,
  MonitoringPreset,
  MonitoringQuery,
  MonitoringRange,
  MonitoringRatio,
  MonitoringUnavailable,
} from "@/lib/api/monitoring";
import { ApiClientError, type ApiResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const presets: MonitoringPreset[] = ["24h", "7d", "30d"];
const dateInputClass =
  "rounded-lg border border-white/10 bg-[#12141c] px-2 py-2 text-xs text-[#c7c8d6] [color-scheme:dark] focus-visible:outline-2 focus-visible:outline-[#f5c542]";

export function previousLabel(range: MonitoringRange) {
  if (range === "24h") return "vs previous 24 hours";
  if (range === "7d") return "vs previous 7 days";
  if (range === "30d") return "vs previous 30 days";
  return "vs previous period";
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoUtc(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function presetDraft(preset: MonitoringPreset): { from: string; to: string } {
  if (preset === "24h") return { from: todayUtc(), to: todayUtc() };
  if (preset === "7d") return { from: daysAgoUtc(6), to: todayUtc() };
  return { from: daysAgoUtc(29), to: todayUtc() };
}

export function MonitoringFrame<T extends { from: string; to: string; range?: string }>({
  queryName,
  path,
  title,
  description,
  icon: Icon,
  load,
  children,
}: {
  queryName: string;
  path: string;
  title: string;
  description: string;
  icon: LucideIcon;
  load: (selection: MonitoringQuery, refresh: boolean) => Promise<ApiResponse<T>>;
  children: (data: T, range: MonitoringRange) => ReactNode;
}) {
  const { accessToken, user } = useAuth();
  const isSuperAdmin = user?.roles?.includes("SuperAdmin") ?? false;
  const [selection, setSelection] = useState<MonitoringQuery>({ range: "30d" });
  const [draftFrom, setDraftFrom] = useState(() => presetDraft("30d").from);
  const [draftTo, setDraftTo] = useState(() => presetDraft("30d").to);
  const [dateError, setDateError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const queryKey = ["admin", "monitoring", queryName, selection];
  const query = useQuery({
    queryKey,
    queryFn: async () => (await load(selection, false)).data,
    enabled: Boolean(accessToken && isSuperAdmin),
    staleTime: 60_000,
  });

  if (!accessToken) {
    return (
      <p className="text-sm text-[#c7c8d6]">
        <Link href={`/login?callbackUrl=${path}`} className="font-semibold text-[#f5c542]">
          Sign in
        </Link>{" "}
        as a super admin.
      </p>
    );
  }

  if (!user) {
    return <p className="text-sm text-[#8b8ca3]">Loading account…</p>;
  }

  if (!isSuperAdmin || (query.error instanceof ApiClientError && query.error.status === 403)) {
    return (
      <p className="text-sm text-[#c7c8d6]" role="alert">
        Super admin access is required to view monitoring.
      </p>
    );
  }

  const busy = query.isFetching || refreshing;
  const presetValue = selection.from ? "custom" : (selection.range ?? "30d");
  const rangeForChildren = query.data?.range ?? (selection.from ? `custom:${selection.from}:${selection.to}` : selection.range ?? "30d");

  const applyCustom = (from: string, to: string) => {
    if (!from || !to) {
      setDateError("Choose both start and end dates.");
      return;
    }
    if (to < from) {
      setDateError("End date must be on or after the start date.");
      return;
    }
    setDateError(null);
    setSelection({ from, to });
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#f5c542]/40 bg-[#f5c542]/10 text-[#f5c542]">
            <Icon className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-black">{title}</h1>
            <p className="text-sm text-[#8b8ca3]">{description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#12141c] px-2 py-1">
            <CalendarDays className="h-4 w-4 shrink-0 text-[#8b8ca3]" aria-hidden />
            <label className="sr-only" htmlFor={`monitoring-from-${queryName}`}>
              From date
            </label>
            <input
              id={`monitoring-from-${queryName}`}
              type="date"
              value={draftFrom}
              max={draftTo || todayUtc()}
              onChange={(event) => {
                const from = event.target.value;
                setDraftFrom(from);
                if (from && draftTo) applyCustom(from, draftTo);
              }}
              className={dateInputClass}
            />
            <span className="text-[#8b8ca3]" aria-hidden>
              –
            </span>
            <label className="sr-only" htmlFor={`monitoring-to-${queryName}`}>
              To date
            </label>
            <input
              id={`monitoring-to-${queryName}`}
              type="date"
              value={draftTo}
              min={draftFrom || undefined}
              max={todayUtc()}
              onChange={(event) => {
                const to = event.target.value;
                setDraftTo(to);
                if (draftFrom && to) applyCustom(draftFrom, to);
              }}
              className={dateInputClass}
            />
          </div>
          <label className="sr-only" htmlFor={`monitoring-range-${queryName}`}>
            Range
          </label>
          <select
            id={`monitoring-range-${queryName}`}
            value={presetValue}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "custom") {
                applyCustom(draftFrom || daysAgoUtc(6), draftTo || todayUtc());
                return;
              }
              const preset = value as MonitoringPreset;
              const next = presetDraft(preset);
              setDateError(null);
              setDraftFrom(next.from);
              setDraftTo(next.to);
              setSelection({ range: preset });
            }}
            className="rounded-lg border border-white/10 bg-[#12141c] px-3 py-2 text-xs"
          >
            {presets.map((value) => (
              <option key={value} value={value}>
                {rangeLabel(value)}
              </option>
            ))}
            <option value="custom">Custom range</option>
          </select>
          <button
            type="button"
            aria-label={busy ? "Refreshing" : "Refresh"}
            title="Refresh (bypasses the cache)"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-[#12141c] text-[#c7c8d6] hover:text-white disabled:opacity-50"
            disabled={busy}
            onClick={() => {
              setRefreshing(true);
              setRefreshError(false);
              void load(selection, true)
                .then((response) => {
                  queryClient.setQueryData(queryKey, response.data);
                })
                .catch(() => setRefreshError(true))
                .finally(() => setRefreshing(false));
            }}
          >
            <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} aria-hidden />
          </button>
        </div>
      </header>

      {dateError ? (
        <p role="alert" className="text-sm text-[#ff6b6b]">
          {dateError}
        </p>
      ) : null}
      {refreshError ? (
        <p role="alert" className="text-sm text-[#ff6b6b]">
          Refresh failed. The last loaded numbers are still shown.
        </p>
      ) : null}
      {query.isError ? (
        <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
          <p>Monitoring could not be loaded.</p>
          <button type="button" className="mt-2 font-semibold text-[#f5c542]" onClick={() => query.refetch()}>
            Try again
          </button>
        </div>
      ) : null}
      {query.isPending && !query.isError ? (
        <p className="text-sm text-[#8b8ca3]">Loading monitoring data…</p>
      ) : null}
      {query.data ? children(query.data, rangeForChildren) : null}
    </div>
  );
}

function CardIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#f5c542]/40 bg-[#f5c542]/10 text-[#f5c542]">
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );
}

export function CountCard({
  label,
  hint,
  metric,
  icon,
  trend,
  color = "#f5c542",
}: {
  label: string;
  hint: string;
  metric: MonitoringCount;
  icon?: LucideIcon;
  trend?: number[];
  color?: string;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-[#f5c542]/25 bg-[#12141c] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-[#c7c8d6]">{label}</p>
        {icon ? <CardIcon icon={icon} /> : null}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-2xl font-black tabular-nums">{metric.value.toLocaleString("en")}</p>
        <Change value={metric.changePercent} />
      </div>
      <div className="mt-2 flex items-end gap-2">
        <div className="min-w-0 flex-1">{trend ? <Sparkline values={trend} color={color} /> : null}</div>
        <span className="shrink-0 text-[10px] text-[#8b8ca3]">{hint}</span>
      </div>
    </article>
  );
}

export function DurationCard({
  label,
  hint,
  metric,
  icon,
  trend,
  color = "#f5c542",
}: {
  label: string;
  hint: string;
  metric: MonitoringDuration;
  icon?: LucideIcon;
  trend?: number[];
  color?: string;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-[#f5c542]/25 bg-[#12141c] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-[#c7c8d6]">{label}</p>
        {icon ? <CardIcon icon={icon} /> : null}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-2xl font-black tabular-nums">{formatDuration(metric.seconds) ?? "—"}</p>
        <Change value={metric.changePercent} />
      </div>
      <div className="mt-2 flex items-end gap-2">
        <div className="min-w-0 flex-1">{trend ? <Sparkline values={trend} color={color} /> : null}</div>
        <span className="shrink-0 text-[10px] text-[#8b8ca3]">
          {metric.seconds == null ? "No finished sessions" : hint}
        </span>
      </div>
    </article>
  );
}

export function RatioCard({
  label,
  hint,
  metric,
  icon,
  format,
  emptyHint,
}: {
  label: string;
  hint: string;
  metric: MonitoringRatio;
  icon?: LucideIcon;
  format: (value: number) => string;
  emptyHint: string;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-[#f5c542]/25 bg-[#12141c] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-[#c7c8d6]">{label}</p>
        {icon ? <CardIcon icon={icon} /> : null}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-2xl font-black tabular-nums">{metric.value == null ? "—" : format(metric.value)}</p>
        <Change value={metric.changePercent} />
      </div>
      <p className="mt-auto pt-2 text-right text-[10px] text-[#8b8ca3]">{metric.value == null ? emptyHint : hint}</p>
    </article>
  );
}

export function UnavailableCard({
  label,
  metric,
  icon,
}: {
  label: string;
  metric: MonitoringUnavailable;
  icon?: LucideIcon;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-[#f5c542]/25 bg-[#12141c] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-[#c7c8d6]">{label}</p>
        {icon ? <CardIcon icon={icon} /> : null}
      </div>
      <p className="mt-1 text-lg font-bold text-[#f5c542]">Unavailable</p>
      <p className="mt-2 text-[11px] leading-snug text-[#8b8ca3]">{metric.reason}</p>
    </article>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-[#f5c542]/20 bg-[#12141c] p-4", className)}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          {subtitle ? <p className="text-xs text-[#8b8ca3]">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-xs font-semibold text-[#5b8def] hover:underline">
      {children}
    </Link>
  );
}

export function UnavailablePanel({
  title,
  metric,
  className,
  action,
}: {
  title: string;
  metric: MonitoringUnavailable;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <Panel title={title} className={className} action={action}>
      <p className="text-sm font-semibold text-[#f5c542]">Unavailable</p>
      <p className="mt-1 text-xs text-[#8b8ca3]">{metric.reason}</p>
    </Panel>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="text-sm text-[#8b8ca3]">{text}</p>;
}

/** `invert` colors a decrease as good, e.g. average search position. */
export function Change({ value, invert = false }: { value: number | null; invert?: boolean }) {
  const label = formatChange(value);
  if (!label) return <span className="text-xs text-[#8b8ca3]">—</span>;
  const up = (value ?? 0) > 0;
  const flat = value === 0;
  return (
    <span
      className={cn(
        "text-xs font-semibold",
        flat ? "text-[#8b8ca3]" : up !== invert ? "text-[#3dd68c]" : "text-[#ff6b6b]",
      )}
    >
      {flat ? "" : up ? "▲ " : "▼ "}
      {label.replace(/^[+-]/, "")}
    </span>
  );
}
