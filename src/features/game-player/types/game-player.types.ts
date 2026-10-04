export type GamePlayerState = "idle" | "loading" | "playing" | "error" | "ended";

export type GamePlayerErrorKind = "unavailable" | "invalid_url" | "load_failed";

export type PlaySessionPhase =
  | "game_view"
  | "game_play_clicked"
  | "game_started"
  | "play_session_active"
  | "game_exit";
