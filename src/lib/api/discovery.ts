import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type { Game } from "@/types/game";

export async function getForYou(): Promise<ApiResponse<Game[]>> {
  // Prefer Recommendation Engine (Phase 09); keep helper name for callers.
  const response = await apiClient.get<{
    items: Array<{ game: Game }>;
  }>("/api/v1/recommendations/for-you?limit=12");
  return {
    ...response,
    data: (response.data?.items ?? []).map((item) => item.game),
  };
}

export async function getTrending(): Promise<ApiResponse<Game[]>> {
  return apiClient.get<Game[]>("/api/v1/trending");
}
