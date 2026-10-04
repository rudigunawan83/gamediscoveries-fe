import type { AnalyticsEventName } from "@/lib/analytics/types";

export const ANALYTICS_EVENTS = {
  pageView: "page_view",
  gameImpression: "game_impression",
  gameClick: "game_click",
  gameStart: "game_start",
  search: "search",
  authLoginViewed: "auth_login_viewed",
  authLoginSubmitted: "auth_login_submitted",
  authLoginSucceeded: "auth_login_succeeded",
  authLoginFailed: "auth_login_failed",
  authRegisterSubmitted: "auth_register_submitted",
  authRegisterSucceeded: "auth_register_succeeded",
  authRegisterFailed: "auth_register_failed",
  authLogout: "auth_logout",
} as const satisfies Record<string, AnalyticsEventName>;
