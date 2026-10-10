import { useMemo } from "react";
import { useLocale, useTranslations, type Messages } from "next-intl";

export type TimeTranslator = (
  key: keyof Messages["Time"],
  values?: Record<string, string | number>,
) => string;

/** Relative "x ago" label; older than a week falls back to a short locale date. */
export function formatTimeAgo(t: TimeTranslator, locale: string, iso: string, now = Date.now()) {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";
  const minutes = Math.floor((now - time) / 60_000);
  if (minutes < 1) return t("justNow");
  if (minutes < 60) return t("minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("hoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t("daysAgo", { count: days });
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(time);
}

/** Time until a deadline ("1d 3h"), "Expired" once passed, or "" when unknown. */
export function formatTimeUntil(t: TimeTranslator, until: string | null | undefined, now = Date.now()) {
  if (!until) return "";
  const ms = new Date(until).getTime() - now;
  if (Number.isNaN(ms)) return "";
  if (ms < 0) return t("expired");
  const minutes = Math.floor(ms / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${t("days", { count: days })} ${t("hours", { count: hours % 24 })}`;
  if (hours >= 1) return `${t("hours", { count: hours })} ${t("minutes", { count: minutes % 60 })}`;
  return t("minutes", { count: minutes });
}

/** Like {@link formatTimeUntil} but phrased as remaining time ("1d 3h left"). */
export function formatTimeLeft(t: TimeTranslator, until: string | null | undefined, now = Date.now()) {
  const duration = formatTimeUntil(t, until, now);
  if (!duration || duration === t("expired")) return duration;
  return t("left", { time: duration });
}

/** Mission reset countdown: "1d 3h" for long waits, otherwise a ticking "hh:mm:ss". */
export function formatCountdown(t: TimeTranslator, until: string, now = Date.now()) {
  const ms = new Date(until).getTime() - now;
  if (!(ms > 0)) return t("resetting");
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  if (days > 0) return `${t("days", { count: days })} ${t("hours", { count: hours })}`;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(Math.floor((totalSec % 3600) / 60))}:${pad(totalSec % 60)}`;
}

/** Short weekday names starting on Monday. */
export function weekdayLabels(locale: string) {
  const format = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, i) => format.format(Date.UTC(2024, 0, 1 + i)));
}

/** Number, date and relative-time formatters for the active locale. */
export function useFormats() {
  const locale = useLocale();
  const t = useTranslations("Time");
  return useMemo(
    () => ({
      grouped: new Intl.NumberFormat(locale),
      compact: new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }),
      date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
      dateTime: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
      timeAgo: (iso: string) => formatTimeAgo(t, locale, iso),
      timeUntil: (until: string | null | undefined) => formatTimeUntil(t, until),
      timeLeft: (until: string | null | undefined) => formatTimeLeft(t, until),
      countdown: (until: string) => formatCountdown(t, until),
    }),
    [locale, t],
  );
}
