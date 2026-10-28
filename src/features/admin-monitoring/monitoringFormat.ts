export const sourceLabels: Record<string, string> = {
  organic_search: "Organic Search",
  direct: "Direct",
  social: "Social",
  referral: "Referral",
  paid_ads: "Paid Ads",
  mobile_app: "Mobile App",
  others: "Others",
};

export function formatChange(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) return null;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || Number.isNaN(seconds)) return null;
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
}

export function formatShare(part: number, total: number): string {
  if (total <= 0) return "—";
  return `${((part / total) * 100).toFixed(1)}%`;
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

export function formatCompact(value: number): string {
  return compact.format(value);
}

/** Axis ticks from zero with a round step; counts never get fractional steps. */
export function niceScale(max: number, count = 4): { max: number; ticks: number[] } {
  let step = 1;
  if (max > 0) {
    const raw = max / count;
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const residual = raw / magnitude;
    const nice = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 2.5 ? 2.5 : residual <= 5 ? 5 : 10;
    step = Math.max(1, Math.ceil(nice * magnitude));
  }
  const ticks = Array.from({ length: count + 1 }, (_, index) => index * step);
  return { max: step * count, ticks };
}

export function formatBucket(bucket: string, hourly: boolean): string {
  return new Date(bucket).toLocaleString(
    "en",
    hourly ? { hour: "2-digit", minute: "2-digit", hour12: false } : { month: "short", day: "numeric" },
  );
}

export function formatDateRange(from: string, to: string): string {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return `${new Date(from).toLocaleDateString("en", options)} – ${new Date(to).toLocaleDateString("en", options)}`;
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatAgo(iso: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return relative.format(seconds, "second");
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), "hour");
  return relative.format(Math.round(seconds / 86_400), "day");
}

export function rangeLabel(range: string) {
  if (range === "24h") return "Last 24 hours";
  if (range === "7d") return "Last 7 days";
  if (range === "30d") return "Last 30 days";
  if (range === "custom" || range.startsWith("custom:")) return "Custom range";
  return range;
}

/** Inclusive calendar day for a monitoring window bound. `to` is exclusive at midnight. */
export function monitoringDay(iso: string, role: "from" | "to"): string {
  const date = new Date(iso);
  if (
    role === "to" &&
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  ) {
    date.setUTCDate(date.getUTCDate() - 1);
  }
  return date.toISOString().slice(0, 10);
}

export function isHourlyMonitoring(data: { range: string; from: string; to: string }) {
  if (data.range === "24h") return true;
  const ms = Date.parse(data.to) - Date.parse(data.from);
  return Number.isFinite(ms) && ms > 0 && ms <= 36 * 3600 * 1000;
}
