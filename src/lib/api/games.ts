import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  GameDetailDto,
  GameSummaryDto,
  HomeDiscoveriesDto,
} from "@/lib/api/types.games";

export interface ListGamesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  platform?: string;
  mobileReady?: boolean;
  sort?: string;
  tag?: string;
}

export async function getGames(
  params: ListGamesParams = {},
): Promise<ApiResponse<GameSummaryDto[]>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.platform) query.set("platform", params.platform);
  if (params.mobileReady !== undefined) {
    query.set("mobileReady", String(params.mobileReady));
  }
  if (params.sort) query.set("sort", params.sort);
  if (params.tag) query.set("tag", params.tag);

  const qs = query.toString();
  return apiClient.get<GameSummaryDto[]>(
    qs ? `/api/v1/games?${qs}` : "/api/v1/games",
    {
      // Large newest catalog (up to 500) can exceed the default budget under load.
      timeoutMs: 30_000,
    },
  );
}

export async function getGameBySlug(
  slug: string,
): Promise<ApiResponse<GameDetailDto>> {
  return apiClient.get<GameDetailDto>(
    `/api/v1/games/${encodeURIComponent(slug)}`,
  );
}

export async function getHomeDiscoveries(): Promise<
  ApiResponse<HomeDiscoveriesDto>
> {
  return apiClient.get<HomeDiscoveriesDto>("/api/v1/discoveries/home");
}
