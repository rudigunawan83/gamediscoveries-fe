"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, RefreshCw, type LucideIcon } from "lucide-react";
import { Sparkline } from "@/features/admin-monitoring/components/MonitoringCharts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  formatChange,
  formatDateRange,
  rangeLabel,
} from "@/features/admin-monitoring/monitoringFormat";
import type {
  MonitoringCount,
  MonitoringRange,
  MonitoringUnavailable,
} from "@/lib/api/monitoring";
import { ApiClientError, type ApiResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ranges: MonitoringRange[] = ["24h", "7d", "30d"];

export function previousLabel(range: MonitoringRange) {
  if (range === "24h") return "vs previous 24 hours";
  if (range === "7d") return "vs previous 7 days";
  return "vs previous 30 days";
}

export function MonitoringFrame<T extends { from: string; to: string }>({
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
  load: (range: MonitoringRange, refresh: boolean) => Promise<ApiResponse<T>>;
  children: (data: T, range: MonitoringRange) => ReactNode;
}) {
  const { accessToken, user } = useAuth();
  const isSuperAdmin = user?.roles?.includes("SuperAdmin") ?? false;
  const [range, setRange] = useState<MonitoringRange>("30d");

  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const queryKey = ["admin", "monitoring", queryName, range];
  const query = useQuery({
    queryKey,
    queryFn: async () => (await load(range, false)).data,
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
          {query.data ? (
            <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#12141c] px-3 py-2 text-xs text-[#c7c8d6]">
              <CalendarDays className="h-4 w-4" aria-hidden />
              {formatDateRange(query.data.from, query.data.to)}
            </span>
          ) : null}
          <label className="sr-only" htmlFor={`monitoring-range-${queryName}`}>
            Range
          </label>
          <select
            id={`monitoring-range-${queryName}`}
            value={range}
            onChange={(event) => setRange(event.target.value as MonitoringRange)}
            className="rounded-lg border border-white/10 bg-[#12141c] px-3 py-2 text-xs"
          >
            {ranges.map((value) => (
              <option key={value} value={value}>
                {rangeLabel(value)}
              </option>
            ))}
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
              void load(range, true)
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
      {query.data ? children(query.data, range) : null}
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

export function Change({ value }: { value: number | null }) {
  const label = formatChange(value);
  if (!label) return <span className="text-xs text-[#8b8ca3]">—</span>;
  const up = (value ?? 0) > 0;
  const flat = value === 0;
  return (
    <span
      className={cn(
        "text-xs font-semibold",
        flat ? "text-[#8b8ca3]" : up ? "text-[#3dd68c]" : "text-[#ff6b6b]",
      )}
    >
      {flat ? "" : up ? "▲ " : "▼ "}
      {label.replace(/^[+-]/, "")}
    </span>
  );
}
