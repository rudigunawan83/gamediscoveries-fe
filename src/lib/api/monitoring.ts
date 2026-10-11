import { apiClient } from "@/lib/api/client";

export type MonitoringRange = "24h" | "7d" | "30d";

export interface MonitoringCount {
  value: number;
  changePercent: number | null;
}

export interface MonitoringUnavailable {
  reason: string;
}

export interface MonitoringPoint {
  bucket: string;
  plays: number;
  activeUsers: number;
  newUsers: number;
  /** Distinct signed-in players in the 1, 7, and 30 days ending at the bucket end. */
  dau: number;
  wau: number;
  mau: number;
}

export interface MonitoringTopGame {
  title: string;
  thumbnailUrl: string | null;
  plays: number;
  changePercent: number | null;
}

export interface MonitoringComponentStatus {
  name: string;
  status: string;
  detail: string | null;
  latencyMs: number | null;
}

export interface MonitoringProvider {
  name: string;
  source: string;
  status: string | null;
  lastSyncedAt: string | null;
}

export interface MonitoringOverview {
  range: string;
  from: string;
  to: string;
  generatedAt: string;
  activeUsers: MonitoringCount;
  gamePlays: MonitoringCount;
  newUsers: MonitoringCount;
  apiSuccessRate: MonitoringUnavailable;
  averageResponseTime: MonitoringUnavailable;
  estimatedAdRevenue: MonitoringUnavailable;
  activity: MonitoringPoint[];
  topGames: MonitoringTopGame[];
  health: MonitoringComponentStatus[];
  providers: MonitoringProvider[];
  recentErrors: MonitoringUnavailable;
  recentIncidents: MonitoringUnavailable;
}

export interface MonitoringDuration {
  seconds: number | null;
  changePercent: number | null;
}

export interface TrafficPoint {
  bucket: string;
  visitors: number;
  pageViews: number;
}

export interface TrafficShare {
  key: string;
  sessions: number;
}

export interface TrafficPage {
  path: string;
  count: number;
  changePercent: number | null;
}

export interface TrafficExitPage {
  path: string;
  exits: number;
  exitRate: number | null;
}

export interface TrafficKeyword {
  keyword: string;
  searches: number;
  changePercent: number | null;
}

export interface MonitoringTraffic {
  range: string;
  from: string;
  to: string;
  generatedAt: string;
  visits: MonitoringCount;
  pageViews: MonitoringCount;
  uniqueVisitors: MonitoringCount;
  averageSessionDuration: MonitoringDuration;
  newVsReturning: { newVisitors: number; returningVisitors: number };
  trend: TrafficPoint[];
  sources: TrafficShare[];
  countries: MonitoringUnavailable;
  devices: TrafficShare[];
  browsers: TrafficShare[];
  landingPages: TrafficPage[];
  exitPages: TrafficExitPage[];
  searchKeywords: TrafficKeyword[];
  mobileApp: MonitoringUnavailable;
}

function monitoringQuery(range: MonitoringRange, refresh: boolean) {
  const query = new URLSearchParams({ range });
  if (refresh) query.set("refresh", "true");
  return query;
}

export function getMonitoringOverview(range: MonitoringRange, refresh = false) {
  return apiClient.get<MonitoringOverview>(
    `/api/v1/admin/monitoring/overview?${monitoringQuery(range, refresh)}`,
  );
}

export function getMonitoringTraffic(range: MonitoringRange, refresh = false) {
  return apiClient.get<MonitoringTraffic>(
    `/api/v1/admin/monitoring/traffic?${monitoringQuery(range, refresh)}`,
  );
}
