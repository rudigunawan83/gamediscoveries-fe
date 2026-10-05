/**
 * Maps legacy FE snake_case event names to Phase 01 canonical UPPER_SNAKE types.
 * Unknown names are uppercased with underscores preserved.
 */
const LEGACY_TO_CANONICAL: Record<string, string> = {
  page_view: "PAGE_VIEW",
  game_viewed: "GAME_VIEW",
  game_impression: "GAME_VIEW",
  game_click: "SEARCH_RESULT_CLICK",
  game_start: "GAME_START",
  game_started: "GAME_START",
  game_play_clicked: "GAME_START",
  game_exit: "GAME_SESSION_END",
  game_exited: "GAME_SESSION_END",
  game_completed: "GAME_SESSION_END",
  search: "SEARCH",
  favorite_added: "FAVORITE_ADDED",
  favorite_removed: "FAVORITE_REMOVED",
  review_created: "REVIEW_CREATED",
  community_review_created: "REVIEW_CREATED",
  share_clicked: "GAME_SHARED",
  share_completed: "GAME_SHARED",
  community_game_shared: "GAME_SHARED",
  auth_login_succeeded: "LOGIN",
  auth_register_succeeded: "SIGN_UP",
  auth_logout: "LOGOUT",
  community_leaderboard_viewed: "LEADERBOARD_VIEW",
  recommendation_impression: "RECOMMENDATION_IMPRESSION",
  recommendation_clicked: "RECOMMENDATION_CLICK",
  recommendation_started: "RECOMMENDATION_GAME_START",
  recommendation_completed: "RECOMMENDATION_COMPLETED",
  recommendation_dismissed: "RECOMMENDATION_DISMISSED",
  recommendation_feedback: "RECOMMENDATION_FEEDBACK",
  recommendation_favorite: "RECOMMENDATION_GAME_FAVORITE",
  recommendation_view: "RECOMMENDATION_VIEW",
  community_viewed: "COMMUNITY_VIEWED",
  community_post_created: "COMMUNITY_POST_CREATED",
  community_post_viewed: "COMMUNITY_POST_VIEWED",
  community_comment_created: "COMMUNITY_COMMENT_CREATED",
  community_reaction_added: "COMMUNITY_REACTION_ADDED",
  community_user_followed: "COMMUNITY_USER_FOLLOWED",
  community_report_created: "COMMUNITY_REPORT_CREATED",
  pwa_installed: "APP_INSTALL",
  pwa_launch: "APP_OPEN",
  pwa_update_available: "APP_UPDATE",
  pwa_update_accepted: "APP_UPDATE",
  organic_landing: "PAGE_VIEW",
  return_session: "APP_OPEN",
  favorites_viewed: "PAGE_VIEW",
  history_viewed: "PAGE_VIEW",
  my_games_viewed: "PAGE_VIEW",
  history_game_clicked: "GAME_VIEW",
  my_games_game_clicked: "GAME_VIEW",
};

export const IMMEDIATE_FLUSH_EVENTS = new Set([
  "GAME_START",
  "GAME_SESSION_START",
  "GAME_SESSION_END",
  "FAVORITE_ADDED",
  "FAVORITE_REMOVED",
  "RATING_CREATED",
  "REVIEW_CREATED",
  "SIGN_UP",
  "LOGIN",
  "LOGOUT",
]);

export function toCanonicalEventType(eventName: string): string {
  if (LEGACY_TO_CANONICAL[eventName]) {
    return LEGACY_TO_CANONICAL[eventName];
  }

  if (/^[A-Z][A-Z0-9_]*$/.test(eventName)) {
    return eventName;
  }

  return eventName.trim().toUpperCase().replace(/\s+/g, "_");
}
