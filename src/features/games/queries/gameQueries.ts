import { queryOptions } from "@tanstack/react-query";
import { fetchGameBySlug, fetchGames } from "@/features/games/api/games.api";

export const gameKeys = {
  all: ["games"] as const,
  detail: (slug: string) => ["games", "detail", slug] as const,
};

export function gamesQueryOptions() {
  return queryOptions({
    queryKey: gameKeys.all,
    queryFn: fetchGames,
  });
}

export function gameBySlugQueryOptions(slug: string) {
  return queryOptions({
    queryKey: gameKeys.detail(slug),
    queryFn: () => fetchGameBySlug(slug),
    enabled: Boolean(slug),
  });
}
