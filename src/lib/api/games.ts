import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type { Game } from "@/types/game";

export async function getGames(): Promise<ApiResponse<Game[]>> {
  return apiClient.get<Game[]>("/api/v1/games");
}

export async function getGameBySlug(slug: string): Promise<ApiResponse<Game>> {
  return apiClient.get<Game>(`/api/v1/games/${encodeURIComponent(slug)}`);
}
