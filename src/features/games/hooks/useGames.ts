"use client";

import { useQuery } from "@tanstack/react-query";
import { gamesQueryOptions } from "@/features/games/queries/gameQueries";

export function useGames() {
  return useQuery(gamesQueryOptions());
}
