export type AnalyticsEventName =
  | "page_view"
  | "game_impression"
  | "game_click"
  | "game_start"
  | "search"
  | "auth_login_viewed"
  | "auth_login_submitted"
  | "auth_login_succeeded"
  | "auth_login_failed"
  | "auth_register_submitted"
  | "auth_register_succeeded"
  | "auth_register_failed"
  | "auth_logout";

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;
