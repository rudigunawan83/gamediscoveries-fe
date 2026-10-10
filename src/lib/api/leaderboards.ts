import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

export interface LeaderboardPeriodDto {
  id: string;
  code: string;
  startAt: string;
  endAt: string;
  status: string;
  timezone: string;
}

export interface LeaderboardUserDto {
  id: string;
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  level?: number | null;
}

export interface LeaderboardItemDto {
  rank: number;
  user: LeaderboardUserDto;
  score: number;
  rankChange?: number | null;
  rankMovement?: string | null;
  gamesPlayed: number;
  validSessions: number;
  xpEarned: number;
}

export interface LeaderboardDetailResponse {
  leaderboard: {
    code: string;
    name: string;
    description?: string | null;
    type: string;
    scoreType: string;
    version: string;
    period?: LeaderboardPeriodDto | null;
  };
  items: LeaderboardItemDto[];
  me?: LeaderboardItemDto | null;
  totalParticipants: number;
}

export interface UserRankResponse {
  rank?: number | null;
  score: number;
  previousRank?: number | null;
  rankChange?: number | null;
  rankMovement?: string | null;
  percentile?: number | null;
  gamesPlayed: number;
  validSessions: number;
  xpEarned: number;
  nextRank?: number | null;
  xpToNextRank?: number | null;
  period?: LeaderboardPeriodDto | null;
}

export interface LeaderboardListItemDto {
  code: string;
  name: string;
  type: string;
  description?: string | null;
  activePeriod?: LeaderboardPeriodDto | null;
  participants: number;
}

export interface AdminLeaderboardOverviewDto {
  code: string;
  name: string;
  periodCode?: string | null;
  periodStatus?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  participants: number;
  topScore: number;
  averageScore: number;
}

export async function listLeaderboards() {
  return apiClient.get<LeaderboardListItemDto[]>("/api/v1/leaderboards");
}

export async function getLeaderboard(code: string, limit = 50) {
  return apiClient.get<LeaderboardDetailResponse>(
    `/api/v1/leaderboards/${encodeURIComponent(code)}?limit=${limit}`,
  );
}

export async function getMyLeaderboardRank(code: string) {
  return apiClient.get<UserRankResponse>(
    `/api/v1/leaderboards/${encodeURIComponent(code)}/me`,
  );
}

export async function getAdminLeaderboards() {
  return apiClient.get<AdminLeaderboardOverviewDto[]>(
    "/api/v1/admin/leaderboards",
  );
}

export async function rebuildLeaderboard(code: string, reason: string) {
  return apiClient.post(`/api/v1/admin/leaderboards/${encodeURIComponent(code)}/rebuild`, {
    reason,
  });
}

export type { ApiResponse };
