import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type { Game } from "@/types/game";

export async function getForYou(): Promise<ApiResponse<Game[]>> {
  return apiClient.get<Game[]>("/api/v1/discovery/for-you");
}

export async function getTrending(): Promise<ApiResponse<Game[]>> {
  return apiClient.get<Game[]>("/api/v1/trending");
}
