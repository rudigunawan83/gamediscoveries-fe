"use client";

import { useId } from "react";
import {
  formatBucket,
  formatCompact,
  formatShare,
  niceScale,
} from "@/features/admin-monitoring/monitoringFormat";

export const chartPalette = [
  "#5b8def",
  "#3dd68c",
  "#f5c542",
  "#b57bff",
  "#ff8a5b",
  "#8b8ca3",
  "#4fd1c5",
  "#ff6b9a",
];

function useSvgId() {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

export interface ChartSeries {
  label: string;
  color: string;
  values: number[];
}

function pickLabels(count: number, wanted = 6): number[] {
  if (count <= wanted) return Array.from({ length: count }, (_, index) => index);
  const step = (count - 1) / (wanted - 1);
  return Array.from({ length: wanted }, (_, index) => Math.round(index * step));
}

export function ChartLegend({ series }: { series: Array<{ label: string; color: string }> }) {
  return (
    <ul className="flex flex-wrap gap-3 text-xs text-[#c7c8d6]">
      {series.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function YAxis({ ticks }: { ticks: number[] }) {
  return (
    <div className="flex h-full w-9 shrink-0 flex-col justify-between text-right text-[10px] leading-none text-[#8b8ca3]">
      {[...ticks].reverse().map((tick) => (
        <span key={tick}>{formatCompact(tick)}</span>
      ))}
    </div>
  );
}

function XAxis({
  buckets,
  hourly,
  centered,
}: {
  buckets: string[];
  hourly: boolean;
  centered: boolean;
}) {
  const count = buckets.length;
  return (
    <div className="relative ml-11 mt-2 h-4 text-[10px] text-[#8b8ca3]">
      {pickLabels(count).map((index) => {
        const left = centered
          ? ((index + 0.5) / count) * 100
          : count === 1
            ? 50
            : (index / (count - 1)) * 100;
        return (
          <span
            key={index}
            className="absolute -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${left}%` }}
          >
            {formatBucket(buckets[index], hourly)}
          </span>
        );
      })}
    </div>
  );
}

function GridLines({ ticks, max }: { ticks: number[]; max: number }) {
  return (
    <>
      {ticks.map((tick) => (
        <span
          key={tick}
          className="absolute inset-x-0 border-t border-dashed border-white/10"
          style={{ bottom: `${(tick / max) * 100}%` }}
        />
      ))}
    </>
  );
}

export function LineChart({
  buckets,
  series,
  hourly,
  label,
}: {
  buckets: string[];
  series: ChartSeries[];
  hourly: boolean;
  label: string;
}) {
  const gradientId = useSvgId();
  const scale = niceScale(Math.max(0, ...series.flatMap((item) => item.values)));
  const x = (index: number) => (buckets.length === 1 ? 50 : (index / (buckets.length - 1)) * 100);
  const y = (value: number) => 100 - (value / scale.max) * 100;

  return (
    <div>
      <div className="flex h-52 gap-2">
        <YAxis ticks={scale.ticks} />
        <div className="relative flex-1">
          <GridLines ticks={scale.ticks} max={scale.max} />
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
            role="img"
            aria-label={label}
          >
            <defs>
              {series.map((item, index) => (
                <linearGradient key={item.label} id={`${gradientId}-${index}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={item.color} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={item.color} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
            {series.map((item, index) => {
              const line = item.values.map((value, i) => `${x(i)},${y(value)}`).join(" ");
              return (
                <g key={item.label}>
                  <polygon points={`0,100 ${line} ${x(item.values.length - 1)},100`} fill={`url(#${gradientId}-${index})`} />
                  <polyline
                    points={line}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <XAxis buckets={buckets} hourly={hourly} centered={false} />
    </div>
  );
}

export function BarChart({
  buckets,
  values,
  hourly,
  label,
  color = "#f5c542",
}: {
  buckets: string[];
  values: number[];
  hourly: boolean;
  label: string;
  color?: string;
}) {
  const scale = niceScale(Math.max(0, ...values));

  return (
    <div>
      <div className="flex h-52 gap-2">
        <YAxis ticks={scale.ticks} />
        <div className="relative flex-1" role="img" aria-label={label}>
          <GridLines ticks={scale.ticks} max={scale.max} />
          <div className="absolute inset-0 flex items-end gap-[3px]">
            {values.map((value, index) => (
              <span
                key={buckets[index]}
                className="flex-1 rounded-t-sm"
                title={`${formatBucket(buckets[index], hourly)}: ${value.toLocaleString("en")}`}
                style={{ height: `${(value / scale.max) * 100}%`, backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
      <XAxis buckets={buckets} hourly={hourly} centered />
    </div>
  );
}

export function Sparkline({ values, color }: { values: number[]; color: string }) {
  const gradientId = useSvgId();
  if (values.length < 2) return null;
  const max = Math.max(1, ...values);
  const line = values
    .map((value, index) => `${(index / (values.length - 1)) * 100},${30 - (value / max) * 26 - 2}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,30 ${line} 100,30`} fill={`url(#${gradientId})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Donut({
  shares,
  label,
  centerLabel,
  size = "h-32 w-32",
}: {
  shares: Array<{ key: string; sessions: number }>;
  label: (key: string) => string;
  centerLabel: string;
  size?: string;
}) {
  const total = shares.reduce((sum, share) => sum + share.sessions, 0);
  const radius = 15.9155;
  const percents = shares.map((share) => (total > 0 ? (share.sessions / total) * 100 : 0));
  const offsets = percents.map((_, index) =>
    percents.slice(0, index).reduce((sum, percent) => sum + percent, 0),
  );

  return (
    <div className="flex items-center gap-4">
      <div className={`relative shrink-0 ${size}`}>
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90" role="img" aria-label={`${centerLabel}: ${total}`}>
          <circle cx="21" cy="21" r={radius} fill="none" stroke="#1c1f2b" strokeWidth="6" />
          {shares.map((share, index) =>
            share.sessions > 0 ? (
              <circle
                key={share.key}
                cx="21"
                cy="21"
                r={radius}
                fill="none"
                stroke={chartPalette[index % chartPalette.length]}
                strokeWidth="6"
                strokeDasharray={`${percents[index]} ${100 - percents[index]}`}
                strokeDashoffset={-offsets[index]}
              />
            ) : null,
          )}
        </svg>
        <span className="absolute inset-0 grid place-items-center text-center">
          <span>
            <span className="block text-base font-black tabular-nums">{total.toLocaleString("en")}</span>
            <span className="block text-[9px] text-[#8b8ca3]">{centerLabel}</span>
          </span>
        </span>
      </div>
      <ul className="min-w-0 flex-1 space-y-1 text-xs">
        {shares.map((share, index) => (
          <li key={share.key} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: chartPalette[index % chartPalette.length] }}
            />
            <span className="min-w-0 flex-1 truncate">{label(share.key)}</span>
            <span className="tabular-nums text-[#c7c8d6]">{formatShare(share.sessions, total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
