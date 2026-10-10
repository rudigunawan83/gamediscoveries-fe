import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { HistoryItem } from "@/features/my-games/types/my-games.types";
import {
  formatPlayedAt,
  type HistoryFormatter,
} from "@/features/my-games/utils/formatPlayedAt";
import type { TimeTranslator } from "@/lib/i18n/format";

export function formatPlayTime(time: TimeTranslator, seconds: number): string {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  if (minutes < 1) return time("lessThanMinute");
  if (minutes < 60) return time("minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? time("hours", { count: hours })
    : `${time("hours", { count: hours })} ${time("minutes", { count: rest })}`;
}

export function formatPlatform(platform: string | null): string | null {
  switch (platform?.toUpperCase()) {
    case "WEB":
      return "Web";
    case "ANDROID":
      return "Android";
    case "IOS":
      return "iOS";
    default:
      return null;
  }
}

/** Server total when available, otherwise the longest single session. */
export function historyPlaySeconds(item: HistoryItem): number {
  return item.totalPlaySeconds > 0 ? item.totalPlaySeconds : item.durationSeconds;
}

/** e.g. "Played 2h ago on Android · 1h 5m total". */
export function formatHistoryMeta(fmt: HistoryFormatter, item: HistoryItem): string {
  const platform = formatPlatform(item.lastPlatform);
  const played = formatPlayedAt(fmt, item.playedAt);
  const seconds = historyPlaySeconds(item);
  return [
    platform ? fmt.t("playedOn", { played, platform }) : played,
    seconds > 0 ? fmt.t("totalTime", { time: formatPlayTime(fmt.time, seconds) }) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function useHistoryFormatter(): HistoryFormatter {
  const t = useTranslations("Library");
  const time = useTranslations("Time");
  const locale = useLocale();
  return useMemo(() => ({ t, time, locale }), [t, time, locale]);
}
