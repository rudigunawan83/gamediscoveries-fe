const WEEK_MS = 7 * 24 * 60 * 60_000;

/** Notifications created within the last seven days of `now`. */
export function countThisWeek(items: readonly { createdAt: string }[], now = Date.now()) {
  return items.filter((item) => {
    const time = Date.parse(item.createdAt);
    return Number.isFinite(time) && now - time <= WEEK_MS;
  }).length;
}
