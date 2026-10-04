import { queryOptions } from "@tanstack/react-query";
import { fetchGameBySlug, fetchGames } from "@/features/games/api/games.api";
import type { ListGamesParams } from "@/lib/api/games";
import { ApiClientError } from "@/lib/api/types";

export const gameKeys = {
  all: ["games"] as const,
  list: (params: ListGamesParams = {}) =>
    ["games", "list", params] as const,
  detail: (slug: string) => ["games", "detail", slug] as const,
};

export function gamesQueryOptions(params: ListGamesParams = {}) {
  return queryOptions({
    queryKey: gameKeys.list(params),
    queryFn: () => fetchGames(params),
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiClientError && error.status === 429) {
        return failureCount < 4;
      }
      return failureCount < 2;
    },
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 8_000),
  });
}

export function gameBySlugQueryOptions(slug: string) {
  return queryOptions({
    queryKey: gameKeys.detail(slug),
    queryFn: () => fetchGameBySlug(slug),
    enabled: Boolean(slug),
  });
}
