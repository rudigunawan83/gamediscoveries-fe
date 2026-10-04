import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type { Game } from "@/types/game";

export async function searchGames(query: string): Promise<ApiResponse<Game[]>> {
  const params = new URLSearchParams({ q: query });
  return apiClient.get<Game[]>(`/api/v1/search/games?${params.toString()}`);
}
