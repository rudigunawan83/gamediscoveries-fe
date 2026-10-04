"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getRecommendations,
  getSimilarRecommendations,
  type RecommendationType,
} from "@/lib/api/recommendations";
import { mapRecommendationItems } from "@/features/recommendations/mappers";

export function useRecommendations(type: RecommendationType, limit = 12) {
  return useQuery({
    queryKey: ["recommendations", type, limit],
    queryFn: async () => {
      const response = await getRecommendations(type, limit);
      return {
        games: mapRecommendationItems(response.data?.items ?? []),
        meta: response.data,
      };
    },
    staleTime: 60_000,
  });
}

export function useForYou(limit = 12) {
  return useRecommendations("for-you", limit);
}

export function useBecauseYouPlayed(limit = 12) {
  return useRecommendations("because-you-played", limit);
}

export function useHiddenGems(limit = 12) {
  return useRecommendations("hidden-gems", limit);
}

export function useTrendingRecommendations(limit = 12) {
  return useRecommendations("trending", limit);
}

export function useSimilarGames(gameId: string | undefined, limit = 12) {
  return useQuery({
    queryKey: ["recommendations", "similar", gameId, limit],
    enabled: Boolean(gameId),
    queryFn: async () => {
      const response = await getSimilarRecommendations(gameId!, limit);
      return {
        games: mapRecommendationItems(response.data?.items ?? []),
        meta: response.data,
      };
    },
    staleTime: 120_000,
  });
}
