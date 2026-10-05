import { apiClient } from "@/lib/api/client";

export type AchievementItem = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  icon?: string | null;
  isSecret: boolean;
  isUnlocked: boolean;
  unlockedAt?: string | null;
  progressValue: number;
  targetValue: number;
  progressPercentage: number;
  rewardXp: number;
};

export type AchievementOverview = {
  totalDefinitions: number;
  activeDefinitions: number;
  userUnlocked: number;
  userInProgress: number;
  completionPercentage: number;
};

export type AchievementListResponse = {
  items: AchievementItem[];
  overview: AchievementOverview;
};

export type AchievementHistoryItem = {
  id: string;
  userId: string;
  achievementDefinitionId: string;
  eventType: string;
  reason?: string | null;
  createdAt: string;
};

export type AdminAchievementDefinition = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  requirementType: string;
  targetValue: number;
  rewardXp: number;
  icon?: string | null;
  isSecret: boolean;
  isActive: boolean;
  seasonId?: string | null;
  createdAt: string;
  updatedAt: string;
  unlockedCount: number;
};

export type AdminAchievementOverview = {
  totalDefinitions: number;
  activeDefinitions: number;
  secretDefinitions: number;
  totalUnlocks: number;
  unlocksToday: number;
};

export async function getMyAchievements() {
  return apiClient.get<AchievementListResponse>("/api/v1/me/achievements");
}

export async function getMyUnlockedAchievements() {
  return apiClient.get<AchievementListResponse>(
    "/api/v1/me/achievements/unlocked",
  );
}

export async function getMyInProgressAchievements() {
  return apiClient.get<AchievementListResponse>(
    "/api/v1/me/achievements/in-progress",
  );
}

export async function getMyRecentAchievements(limit = 10) {
  return apiClient.get<AchievementHistoryItem[]>(
    `/api/v1/me/achievements/recent?limit=${limit}`,
  );
}

export async function getMyAchievementByCode(code: string) {
  return apiClient.get<AchievementItem>(
    `/api/v1/me/achievements/${encodeURIComponent(code)}`,
  );
}

export async function getAdminAchievements() {
  return apiClient.get<{
    items: AdminAchievementDefinition[];
    overview: AdminAchievementOverview;
  }>("/api/v1/admin/gamification/achievements");
}

export async function setAdminAchievementActive(
  id: string,
  active: boolean,
  reason?: string,
) {
  return apiClient.post(
    `/api/v1/admin/gamification/achievements/${id}/${active ? "activate" : "deactivate"}`,
    { reason },
  );
}

export async function getAdminUserAchievements(userId: string) {
  return apiClient.get<AchievementItem[]>(
    `/api/v1/admin/users/${userId}/achievements`,
  );
}

export async function grantUserAchievement(
  userId: string,
  achievementId: string,
  reason?: string,
) {
  return apiClient.post(
    `/api/v1/admin/users/${userId}/achievements/${achievementId}/grant`,
    { reason },
  );
}

export async function revokeUserAchievement(
  userId: string,
  achievementId: string,
  reason?: string,
) {
  return apiClient.post(
    `/api/v1/admin/users/${userId}/achievements/${achievementId}/revoke`,
    { reason },
  );
}
