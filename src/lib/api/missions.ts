import { apiClient } from "@/lib/api/client";

export type MissionDto = {
  id: string;
  code: string;
  type: "DAILY" | "WEEKLY" | string;
  title: string;
  description: string;
  icon?: string | null;
  requirementType: string;
  progress: number;
  target: number;
  percentage: number;
  rewardXp: number;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED" | "CANCELLED" | string;
  difficulty: string;
  periodStart: string;
  expiresAt: string;
  completedAt?: string | null;
};

export type MyMissions = {
  daily: MissionDto[];
  weekly: MissionDto[];
  dailyExpiresAt: string;
  weeklyExpiresAt: string;
  timeZone: string;
};

export type MissionTemplate = {
  id: string;
  code: string;
  type: string;
  title: string;
  description: string;
  icon?: string | null;
  requirementType: string;
  targetValue: number;
  rewardXp: number;
  difficulty: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type MissionAnalytics = {
  assigned: number;
  completed: number;
  expired: number;
  completionRate: number;
  expirationRate: number;
  averageProgress: number;
  xpAwarded: number;
  completionByCode: Array<{ name: string; count: number }>;
};

export async function getMyMissions() {
  return apiClient.get<MyMissions>("/api/v1/me/missions");
}

export async function getMyMissionHistory(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
}) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.pageSize) search.set("pageSize", String(params.pageSize));
  if (params?.type) search.set("type", params.type);
  if (params?.status) search.set("status", params.status);
  const qs = search.toString();
  return apiClient.get<{
    items: MissionDto[];
    page: number;
    pageSize: number;
    total: number;
  }>(`/api/v1/me/missions/history${qs ? `?${qs}` : ""}`);
}

export async function listMissionTemplates() {
  return apiClient.get<{ items: MissionTemplate[] }>(
    "/api/v1/admin/gamification/missions/templates",
  );
}

export async function setMissionTemplateActive(id: string, active: boolean) {
  return apiClient.post(
    `/api/v1/admin/gamification/missions/templates/${id}/${active ? "activate" : "deactivate"}`,
  );
}

export async function getMissionAnalytics() {
  return apiClient.get<MissionAnalytics>(
    "/api/v1/admin/gamification/missions/analytics",
  );
}