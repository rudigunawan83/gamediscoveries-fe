import type { AnalyticsEventName } from "@/lib/analytics/types";

export const ANALYTICS_EVENTS = {
  pageView: "page_view",
  gameImpression: "game_impression",
  gameClick: "game_click",
  gameStart: "game_start",
  search: "search",
} as const satisfies Record<string, AnalyticsEventName>;
