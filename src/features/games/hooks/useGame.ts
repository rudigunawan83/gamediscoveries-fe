"use client";

import { useQuery } from "@tanstack/react-query";
import { gameBySlugQueryOptions } from "@/features/games/queries/gameQueries";

export function useGame(slug: string) {
  return useQuery(gameBySlugQueryOptions(slug));
}
