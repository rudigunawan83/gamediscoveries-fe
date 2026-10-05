import { apiClient } from "@/lib/api/client";
import type { Game } from "@/types/game";

export type DiscoveryRankingItem = {
  rank: number;
  score: number;
  trend: string;
  trendPercentage: number;
  previousRank?: number | null;
  rankChange: number;
  game: {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    coverUrl?: string | null;
    category?: string | null;
    averageRating?: number | null;
    publishedAt?: string | null;
  };
};

export type DiscoveryRankingResponse = {
  type: string;
  period: string;
  items: DiscoveryRankingItem[];
  page: number;
  pageSize: number;
  total: number;
};

export type AdminDiscoveryOverview = {
  scoredGames: number;
  averageDiscoveryScore: number;
  averageTrendingScore: number;
  risingGames: number;
  hotGames: number;
  decliningGames: number;
  newGames: number;
  lastCalculatedAt?: string | null;
  scoreVersion: number;
};

export type AdminDiscoveryConfig = {
  scoreVersion: number;
  popularityWeight: number;
  engagementWeight: number;
  qualityWeight: number;
  momentumWeight: number;
  growthWeight: number;
  freshnessWeight: number;
  trendingRecentWeight: number;
  trendingMomentumWeight: number;
  trendingGrowthWeight: number;
  trendingEngagementWeight: number;
  trendingFreshnessWeight: number;
  freshnessDecayDays: number;
  newGameDays: number;
  minValidSessionsForNewTrending: number;
  growthSmoothing: number;
  bayesianM: number;
  risingGrowthThreshold: number;
  decliningGrowthThreshold: number;
  scoreValidMinutes: number;
  updatedAt: string;
};

export async function getDiscoveryRanking(params?: {
  type?: string;
  period?: string;
  category?: string;
  limit?: number;
  page?: number;
}) {
  const search = new URLSearchParams();
  if (params?.type) search.set("type", params.type);
  if (params?.period) search.set("period", params.period);
  if (params?.category) search.set("category", params.category);
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.page) search.set("page", String(params.page));
  const qs = search.toString();
  return apiClient.get<DiscoveryRankingResponse>(
    `/api/v1/discovery${qs ? `?${qs}` : ""}`,
  );
}

export async function getDiscoveryTrending(limit = 20, period = "24h") {
  return apiClient.get<DiscoveryRankingResponse>(
    `/api/v1/discovery/trending?period=${period}&limit=${limit}`,
  );
}

export async function getAdminDiscoveryOverview() {
  return apiClient.get<AdminDiscoveryOverview>(
    "/api/v1/admin/discovery/overview",
  );
}

export async function getAdminDiscoveryConfig() {
  return apiClient.get<AdminDiscoveryConfig>("/api/v1/admin/discovery/config");
}

export async function getAdminDiscoveryRankings(type = "TRENDING", limit = 50) {
  return apiClient.get<DiscoveryRankingResponse>(
    `/api/v1/admin/discovery/rankings?type=${type}&limit=${limit}`,
  );
}

export async function recalculateDiscoveryScores() {
  return apiClient.post("/api/v1/admin/discovery/recalculate", {});
}

export function mapRankingItemToGame(item: DiscoveryRankingItem): Game {
  return {
    id: item.game.id,
    slug: item.game.slug,
    title: item.game.title,
    description: item.game.description ?? undefined,
    thumbnailUrl: item.game.thumbnailUrl ?? "",
    coverUrl: item.game.coverUrl ?? undefined,
    categories: item.game.category
      ? [{ id: item.game.category, slug: item.game.category, name: item.game.category }]
      : [],
    tags: [],
    rating: item.game.averageRating ?? undefined,
    publishedAt: item.game.publishedAt ?? undefined,
  };
}

export function trendBadge(trend: string): string {
  switch (trend) {
    case "RISING":
      return "📈 Rising";
    case "HOT":
      return "🔥 Trending";
    case "NEW":
      return "✨ New";
    case "DECLINING":
      return "↓ Declining";
    default:
      return "⭐ Popular";
  }
}
