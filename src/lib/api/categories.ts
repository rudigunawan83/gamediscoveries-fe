import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type { Category } from "@/types/game";

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return apiClient.get<Category[]>("/api/v1/categories");
}
