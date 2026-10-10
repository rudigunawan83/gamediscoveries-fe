export type NotificationCategory =
  | "achievements"
  | "missions"
  | "leaderboard"
  | "games"
  | "system";

export function categoryFor(type: string): NotificationCategory {
  const normalized = type.toLowerCase();
  if (normalized.includes("achievement")) return "achievements";
  if (normalized.includes("mission") || normalized.includes("challenge")) return "missions";
  if (normalized.includes("leaderboard") || normalized.includes("rank")) return "leaderboard";
  if (normalized.includes("game") || normalized.includes("review") || normalized.includes("community")) return "games";
  return "system";
}

/** Where a notification leads when clicked; `null` when it has no page of its own. */
export function notificationHref(item: {
  type: string;
  entityType?: string | null;
  entityId?: string | null;
}): string | null {
  if (item.entityType === "post" && item.entityId) {
    return `/community/post/${encodeURIComponent(item.entityId)}`;
  }
  if (item.entityType === "achievement") return "/community/achievements";
  switch (categoryFor(item.type)) {
    case "achievements":
      return "/community/achievements";
    case "missions":
      return "/missions";
    case "leaderboard":
      return "/community/leaderboards";
    default:
      return null;
  }
}
