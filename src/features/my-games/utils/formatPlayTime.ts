import type { HistoryItem } from "@/features/my-games/types/my-games.types";
import { formatPlayedAt } from "@/features/my-games/utils/formatPlayedAt";

export function formatPlayTime(seconds: number): string {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
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

/** e.g. "Played 2 hours ago on Android · 1h 5m total". */
export function formatHistoryMeta(item: HistoryItem): string {
  const platform = formatPlatform(item.lastPlatform);
  const played = formatPlayedAt(item.playedAt);
  const seconds = historyPlaySeconds(item);
  return [
    platform ? `${played} on ${platform}` : played,
    seconds > 0 ? `${formatPlayTime(seconds)} total` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
