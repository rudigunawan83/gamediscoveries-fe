import { isToday, isYesterday } from "date-fns";
import type { Messages } from "next-intl";
import { formatTimeAgo, type TimeTranslator } from "@/lib/i18n/format";

export type LibraryTranslator = (
  key: keyof Messages["Library"],
  values?: Record<string, string | number>,
) => string;

export type HistoryFormatter = {
  t: LibraryTranslator;
  time: TimeTranslator;
  locale: string;
};

export function formatPlayedAt(
  fmt: HistoryFormatter,
  value: string | Date,
  now = Date.now(),
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return fmt.t("recentlyPlayed");
  }

  if (!isToday(date) && isYesterday(date)) {
    return fmt.t("playedYesterday");
  }

  return fmt.t("playedAgo", {
    time: formatTimeAgo(fmt.time, fmt.locale, date.toISOString(), now),
  });
}
