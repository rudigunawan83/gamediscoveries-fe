"use client";

import { useQuery } from "@tanstack/react-query";
import { gamesQueryOptions } from "@/features/games/queries/gameQueries";
import type { ListGamesParams } from "@/lib/api/games";

export function useGames(params: ListGamesParams = {}) {
  return useQuery(gamesQueryOptions(params));
}
