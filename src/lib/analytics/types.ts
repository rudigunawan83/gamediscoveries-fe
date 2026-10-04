export type AnalyticsEventName =
  | "page_view"
  | "game_impression"
  | "game_click"
  | "game_start"
  | "search";

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;
