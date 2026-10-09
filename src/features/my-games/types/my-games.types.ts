import type { Game } from "@/types/game";

export type MyGamesTab = "all" | "favorites" | "history";

export interface FavoriteItem {
  gameId: string;
  favoritedAt: string;
  game: Game;
}

export interface HistoryItem {
  id: string;
  gameId: string;
  playedAt: string;
  durationSeconds: number;
  totalPlaySeconds: number;
  playCount: number;
  /** `WEB`, `ANDROID` or `IOS` of the last session that ended. */
  lastPlatform: string | null;
  game: Game;
}

export interface LibraryPageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}
