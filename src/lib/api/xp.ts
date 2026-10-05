import { apiClient } from "@/lib/api/client";

export type XpAwardedItem = {
  ruleCode: string;
  xp: number;
};

export type UserXpSummary = {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  recentTransactions: Array<{
    transactionId: string;
    ruleCode: string;
    eventType: string;
    referenceType: string;
    referenceId: string;
    xpAmount: number;
    description: string;
    createdAt: string;
  }>;
};

export async function getMyXp() {
  return apiClient.get<UserXpSummary>("/api/v1/me/xp");
}

export async function getMyXpTransactions(params?: {
  limit?: number;
  offset?: number;
  ruleCode?: string;
}) {
  const search = new URLSearchParams();
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));
  if (params?.ruleCode) search.set("ruleCode", params.ruleCode);
  const qs = search.toString();
  return apiClient.get<{ items: UserXpSummary["recentTransactions"] }>(
    `/api/v1/me/xp/transactions${qs ? `?${qs}` : ""}`,
  );
}
