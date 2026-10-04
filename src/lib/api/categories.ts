import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

export type CategoryDto = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  gameCount: number;
  lastContentAt?: string | null;
};

export async function getCategories(): Promise<ApiResponse<CategoryDto[]>> {
  return apiClient.get<CategoryDto[]>("/api/v1/categories", {
    timeoutMs: 20_000,
  });
}
