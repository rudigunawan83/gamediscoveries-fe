import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

export type RecommendationType =
  | "for-you"
  | "similar-games"
  | "because-you-played"
  | "trending"
  | "new-discoveries"
  | "hidden-gems"
  | "quick-play";

export interface RecommendationGameDto {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  category?: string | null;
  orientation?: string | null;
}

export interface RecommendationReasonDto {
  type: string;
  label: string;
}

export interface RecommendationItemDto {
  game: RecommendationGameDto;
  score: number;
  rank: number;
  reason: string;
  reasonDetail?: RecommendationReasonDto | null;
  position?: number;
}

export interface RecommendationResponse {
  items: RecommendationItemDto[];
  type: RecommendationType | string;
  algorithmVersion: string;
  generatedAt: string;
  expiresAt: string;
  cacheHit: boolean;
  strategy?: string;
  profileLevel?: number;
  recommendationRequestId?: string | null;
}

export interface RecommendationHomeResponse {
  sections: Array<{
    type: string;
    title: string;
    items: RecommendationItemDto[];
  }>;
  algorithmVersion: string;
  profileLevel: number;
  recommendationRequestId: string;
}

export interface AdminRecommendationOverview {
  requests: number;
  impressions: number;
  clicks: number;
  ctr: number;
  feedbackCount: number;
  personalizedShare: number;
  lastRequestAt?: string | null;
}

export async function getRecommendations(
  type: RecommendationType = "for-you",
  limit = 12,
): Promise<ApiResponse<RecommendationResponse>> {
  const path =
    type === "for-you"
      ? "/api/v1/recommendations/for-you"
      : type === "because-you-played"
        ? "/api/v1/recommendations/because-you-played"
        : type === "trending"
          ? "/api/v1/recommendations/trending"
          : type === "new-discoveries"
            ? "/api/v1/recommendations/new"
            : type === "hidden-gems"
              ? "/api/v1/recommendations/hidden-gems"
              : type === "quick-play"
                ? "/api/v1/recommendations/quick-play"
                : `/api/v1/recommendations?type=${encodeURIComponent(type)}`;

  return apiClient.get<RecommendationResponse>(`${path}?limit=${limit}`);
}

export async function getSimilarRecommendations(
  gameId: string,
  limit = 12,
): Promise<ApiResponse<RecommendationResponse>> {
  return apiClient.get<RecommendationResponse>(
    `/api/v1/recommendations/similar/${gameId}?limit=${limit}`,
  );
}

export async function getRecommendationHome(limit = 12) {
  return apiClient.get<RecommendationHomeResponse>(
    `/api/v1/recommendations/home?limit=${limit}`,
  );
}

export async function postRecommendationFeedback(
  gameId: string,
  feedbackType: string,
  recommendationRequestId?: string | null,
  section?: string,
) {
  return apiClient.post(`/api/v1/recommendations/${gameId}/feedback`, {
    feedbackType,
    recommendationRequestId,
    section,
  });
}

export async function postRecommendationImpression(payload: {
  recommendationRequestId: string;
  gameId: string;
  position: number;
  section: string;
  eventType?: string;
}) {
  return apiClient.post("/api/v1/recommendations/impressions", payload);
}

export async function getAdminRecommendationOverview() {
  return apiClient.get<AdminRecommendationOverview>(
    "/api/v1/admin/recommendations/overview",
  );
}
