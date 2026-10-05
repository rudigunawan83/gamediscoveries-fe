import { apiClient } from "@/lib/api/client";

export type StreakStatus = {
  currentStreak: number;
  longestStreak: number;
  status: "ACTIVE" | "AT_RISK" | "BROKEN" | "FROZEN" | string;
  streakStartDate?: string | null;
  lastQualifyingActivityDate?: string | null;
  todayQualified: boolean;
  freezeCount: number;
  maxFreezeCount: number;
  nextMilestone?: {
    days: number;
    title: string;
    remainingDays: number;
    rewardXp?: number | null;
  } | null;
  lastAchievedMilestone?: {
    days: number;
    title: string;
    remainingDays: number;
    rewardXp?: number | null;
  } | null;
};

export type StreakHistoryItem = {
  id: string;
  eventType: string;
  streakValue: number;
  activityDate?: string | null;
  previousStreak?: number | null;
  newStreak?: number | null;
  reason?: string | null;
  createdAt: string;
};

export type AdminStreakOverview = {
  usersWithActiveStreak: number;
  averageCurrentStreak: number;
  averageLongestStreak: number;
  usersAt1Day: number;
  usersAt7Days: number;
  usersAt30Days: number;
  freezesConsumedTotal: number;
  milestonesReached: number;
};

export async function getMyStreak() {
  return apiClient.get<StreakStatus>("/api/v1/me/streak");
}

export async function getMyStreakHistory(params?: {
  page?: number;
  pageSize?: number;
  eventType?: string;
}) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.pageSize) search.set("pageSize", String(params.pageSize));
  if (params?.eventType) search.set("eventType", params.eventType);
  const qs = search.toString();
  return apiClient.get<{
    items: StreakHistoryItem[];
    page: number;
    pageSize: number;
    total: number;
  }>(`/api/v1/me/streak/history${qs ? `?${qs}` : ""}`);
}

export async function getAdminStreakOverview() {
  return apiClient.get<AdminStreakOverview>("/api/v1/admin/gamification/streaks");
}

export async function getAdminUserStreak(userId: string) {
  return apiClient.get<{
    userId: string;
    streak: StreakStatus;
    recentHistory: StreakHistoryItem[];
  }>(`/api/v1/admin/users/${userId}/streak`);
}

export async function grantStreakFreeze(
  userId: string,
  body: { amount: number; reason: string },
) {
  return apiClient.post(`/api/v1/admin/users/${userId}/streak/freeze`, body);
}

export async function removeStreakFreeze(
  userId: string,
  body: { amount: number; reason: string },
) {
  return apiClient.post(
    `/api/v1/admin/users/${userId}/streak/freeze/remove`,
    body,
  );
}

export async function resetUserStreakV2(userId: string, reason: string) {
  return apiClient.post(`/api/v1/admin/users/${userId}/streak/reset`, {
    reason,
  });
}
