import { apiClient } from "@/lib/api/client";

export type LevelInfo = {
  level: number;
  title: string;
  description?: string | null;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercentage: number;
  isMaxLevel: boolean;
  nextLevel?: number | null;
  nextTitle?: string | null;
};

export type UserProgress = {
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  level: LevelInfo;
  stats: {
    totalGameSessions: number;
    uniqueGamesPlayed: number;
    favorites: number;
    currentStreak: number;
    longestStreak: number;
  };
  streak?: {
    current: number;
    longest: number;
    status: string;
    todayQualified: boolean;
    freezeCount: number;
    nextMilestone?: number | null;
  } | null;
};

export type XpTransaction = {
  transactionId: string;
  ruleCode: string;
  eventType: string;
  referenceType: string;
  referenceId: string;
  xpAmount: number;
  description: string;
  createdAt: string;
};

export type PagedXpTransactions = {
  items: XpTransaction[];
  page: number;
  pageSize: number;
  total: number;
};

export type GamificationOverview = {
  totalUsers: number;
  usersWithXp: number;
  totalXpAwarded: number;
  xpToday: number;
  xpThisWeek: number;
  averageLevel: number;
  levelDistribution: Array<{ name: string; count: number }>;
  xpByRule: Array<{ name: string; count: number }>;
};

export type AdminUserListItem = {
  id: string;
  email: string;
  displayName: string;
  status: string;
  level: number;
  totalXp: number;
  uniqueGamesPlayed: number;
  favorites: number;
  currentStreak: number;
  lastActivityAt?: string | null;
  createdAt: string;
};

export type LevelDefinition = {
  level: number;
  requiredTotalXp: number;
  title: string;
  description?: string | null;
  isActive: boolean;
};

export type AuditLog = {
  id: string;
  adminId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string | null;
  createdAt: string;
};

const RULE_LABELS: Record<string, string> = {
  FIRST_GAME_DISCOVERY: "First Game Discovery",
  NEW_GAME_DISCOVERED: "Discovered a New Game",
  NEW_GENRE_DISCOVERED: "Discovered a New Genre",
  VALID_GAME_SESSION: "Valid Game Session",
  SESSION_MILESTONE_2M: "2 Minute Session",
  SESSION_MILESTONE_5M: "5 Minute Session",
  SESSION_MILESTONE_10M: "10 Minute Session",
  FAVORITE_ADDED: "Favorite Added",
  RATING_CREATED: "Rating Created",
  REVIEW_CREATED: "Review Created",
  ADMIN_ADJUSTMENT: "Admin Adjustment",
  XP_REVERSAL: "XP Reversal",
  DAILY_MISSION_COMPLETED: "Daily Mission",
  WEEKLY_CHALLENGE_COMPLETED: "Weekly Challenge",
  STREAK_MILESTONE: "Streak Milestone",
  ACHIEVEMENT_UNLOCK: "Achievement Unlocked",
};

export function xpRuleLabel(ruleCode: string, fallback?: string) {
  return RULE_LABELS[ruleCode] || fallback || ruleCode.replaceAll("_", " ");
}

export async function getMyProgress() {
  return apiClient.get<UserProgress>("/api/v1/me/progress");
}

export async function getMyXpTransactions(params?: {
  page?: number;
  pageSize?: number;
  ruleCode?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.pageSize) search.set("pageSize", String(params.pageSize));
  if (params?.ruleCode) search.set("ruleCode", params.ruleCode);
  if (params?.dateFrom) search.set("dateFrom", params.dateFrom);
  if (params?.dateTo) search.set("dateTo", params.dateTo);
  const qs = search.toString();
  return apiClient.get<PagedXpTransactions>(
    `/api/v1/me/xp/transactions${qs ? `?${qs}` : ""}`,
  );
}

export async function getGamificationOverview() {
  return apiClient.get<GamificationOverview>(
    "/api/v1/admin/gamification/overview",
  );
}

export async function listAdminUsers(params?: {
  search?: string;
  level?: number;
  status?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  const search = new URLSearchParams();
  if (params?.search) search.set("search", params.search);
  if (params?.level != null) search.set("level", String(params.level));
  if (params?.status) search.set("status", params.status);
  if (params?.sort) search.set("sort", params.sort);
  if (params?.page) search.set("page", String(params.page));
  if (params?.pageSize) search.set("pageSize", String(params.pageSize));
  const qs = search.toString();
  return apiClient.get<{
    items: AdminUserListItem[];
    page: number;
    pageSize: number;
    total: number;
  }>(`/api/v1/admin/users${qs ? `?${qs}` : ""}`);
}

export async function getAdminUser(userId: string) {
  return apiClient.get<{
    user: AdminUserListItem;
    level: LevelInfo;
    stats: UserProgress["stats"];
    recentTransactions: XpTransaction[];
  }>(`/api/v1/admin/users/${userId}`);
}

export async function adjustUserXp(
  userId: string,
  body: { amount: number; reason: string },
) {
  return apiClient.post(`/api/v1/admin/users/${userId}/xp-adjustments`, body);
}

export async function resetUserGamification(
  userId: string,
  reason: string,
) {
  return apiClient.post(`/api/v1/admin/users/${userId}/gamification/reset`, {
    reason,
  });
}

export async function resetUserStreak(userId: string, reason?: string) {
  return apiClient.post(`/api/v1/admin/users/${userId}/streak/reset`, {
    reason,
  });
}

export async function suspendUser(userId: string, reason?: string) {
  return apiClient.post(`/api/v1/admin/users/${userId}/suspend`, { reason });
}

export async function unsuspendUser(userId: string, reason?: string) {
  return apiClient.post(`/api/v1/admin/users/${userId}/unsuspend`, { reason });
}

export async function listLevels(includeInactive = true) {
  return apiClient.get<{ items: LevelDefinition[] }>(
    `/api/v1/admin/gamification/levels?includeInactive=${includeInactive}`,
  );
}

export async function upsertLevel(body: LevelDefinition) {
  return apiClient.put(
    `/api/v1/admin/gamification/levels/${body.level}`,
    body,
  );
}

export async function createLevel(body: LevelDefinition) {
  return apiClient.post("/api/v1/admin/gamification/levels", body);
}

export async function setLevelActive(level: number, active: boolean) {
  return apiClient.post(
    `/api/v1/admin/gamification/levels/${level}/${active ? "activate" : "deactivate"}`,
  );
}

export async function listAuditLogs(params?: {
  limit?: number;
  offset?: number;
  action?: string;
}) {
  const search = new URLSearchParams();
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));
  if (params?.action) search.set("action", params.action);
  const qs = search.toString();
  return apiClient.get<{ items: AuditLog[] }>(
    `/api/v1/admin/audit-logs${qs ? `?${qs}` : ""}`,
  );
}
