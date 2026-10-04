import { formatDistanceToNowStrict, isYesterday, isToday } from "date-fns";

export function formatPlayedAt(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "Recently played";
  }

  if (isToday(date)) {
    return `Played ${formatDistanceToNowStrict(date, { addSuffix: true })}`;
  }

  if (isYesterday(date)) {
    return "Played yesterday";
  }

  return `Played ${formatDistanceToNowStrict(date, { addSuffix: true })}`;
}
