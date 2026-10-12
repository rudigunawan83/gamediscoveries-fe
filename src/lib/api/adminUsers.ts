import { apiClient } from "@/lib/api/client";

export const ADMIN_USER_ROLES = ["Player", "Moderator", "Admin", "SuperAdmin", "Developer", "Advertiser"] as const;
export const ADMIN_USER_STATUSES = ["active", "suspended"] as const;
export const ADMIN_USER_JOINED = ["24h", "7d", "30d", "90d", "365d"] as const;

export type AdminUserRole = (typeof ADMIN_USER_ROLES)[number];
export type AdminUserStatus = (typeof ADMIN_USER_STATUSES)[number];
export type AdminUserJoined = (typeof ADMIN_USER_JOINED)[number];
export type AdminUserSort = "lastActive" | "joined" | "games" | "name" | "xp";

export interface AdminUserRow {
  id: string;
  email: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  lastActiveAt: string | null;
  createdAt: string;
  gamesPlayed: number;
  level: number;
  totalXp: number;
}

export interface AdminUsersPage {
  items: AdminUserRow[];
  page: number;
  pageSize: number;
  total: number;
}

/** `trend` is oldest first, one point per day. */
export interface AdminUsersStat {
  value: number;
  changePercent: number | null;
  trend: number[];
}

export interface AdminUsersStats {
  totalUsers: AdminUsersStat;
  activeToday: AdminUsersStat;
  newThisMonth: AdminUsersStat;
  suspended: number;
  suspendedPercent: number | null;
  generatedAt: string;
}

export interface AdminUsersFilters {
  search?: string;
  status?: AdminUserStatus;
  role?: AdminUserRole;
  joined?: AdminUserJoined;
  sort?: AdminUserSort;
  dir?: "asc" | "desc";
}

export function adminUsersQueryString(filters: AdminUsersFilters, page?: number, pageSize?: number) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status) params.set("status", filters.status);
  if (filters.role) params.set("role", filters.role);
  if (filters.joined) params.set("joined", filters.joined);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.dir) params.set("dir", filters.dir);
  if (page) params.set("page", String(page));
  if (pageSize) params.set("pageSize", String(pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function listAdminUserDirectory(filters: AdminUsersFilters, page: number, pageSize: number) {
  return apiClient.get<AdminUsersPage>(
    `/api/v1/admin/users/directory${adminUsersQueryString(filters, page, pageSize)}`,
  );
}

export function getAdminUsersStats() {
  return apiClient.get<AdminUsersStats>("/api/v1/admin/users/stats");
}

export function exportAdminUsersCsv(filters: AdminUsersFilters) {
  return apiClient.get<string>(`/api/v1/admin/users/export${adminUsersQueryString(filters)}`, {
    timeoutMs: 60_000,
  });
}
