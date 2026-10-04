import type { MyGamesTab } from "@/features/my-games/types/my-games.types";

export const myGamesKeys = {
  all: ["my-games"] as const,
  tab: (userId: string | undefined, tab: MyGamesTab) =>
    ["my-games", userId ?? "anonymous", { tab }] as const,
  favorites: (userId: string | undefined, page: number, pageSize: number) =>
    ["favorites", userId ?? "anonymous", { page, pageSize }] as const,
  favoritesRoot: (userId: string | undefined) =>
    ["favorites", userId ?? "anonymous"] as const,
  history: (userId: string | undefined, page: number, pageSize: number) =>
    ["history", userId ?? "anonymous", { page, pageSize }] as const,
  historyRoot: (userId: string | undefined) =>
    ["history", userId ?? "anonymous"] as const,
  favoriteStatus: (userId: string | undefined, gameId: string) =>
    ["favorite-status", userId ?? "anonymous", gameId] as const,
};
