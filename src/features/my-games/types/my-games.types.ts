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
