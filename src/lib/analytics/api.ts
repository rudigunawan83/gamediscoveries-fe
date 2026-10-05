import { apiClient } from "@/lib/api/client";

export interface AnalyticsIngestEvent {
  eventId: string;
  eventType: string;
  anonymousId: string;
  sessionId: string;
  gameId?: string;
  source: "WEB" | "MOBILE" | "GAME" | "API" | "ADMIN" | "SYSTEM";
  platform: "WEB" | "ANDROID" | "IOS" | "DESKTOP" | "UNKNOWN";
  deviceType?: string;
  appVersion?: string;
  pageUrl?: string;
  referrerUrl?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  occurredAt: string;
}

export interface AnalyticsBatchResult {
  accepted: number;
  duplicates: number;
  rejected: number;
  results: Array<{ eventId: string; status: string; reason?: string | null }>;
}

export async function postAnalyticsEvent(event: AnalyticsIngestEvent) {
  return apiClient.post("/api/v1/events", event, { timeoutMs: 8_000 });
}

export async function postAnalyticsEventBatch(events: AnalyticsIngestEvent[]) {
  return apiClient.post<AnalyticsBatchResult>(
    "/api/v1/events/batch",
    { events },
    { timeoutMs: 12_000 },
  );
}
