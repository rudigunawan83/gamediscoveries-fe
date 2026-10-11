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
  /** Keys: `web`, `android`, `ios`, or `app` for an unrecognised app platform. */
  platforms: TrafficShare[];
}

/** Players include guests; playtime is server-measured active time of finished sessions. */
export interface GamePlaysPoint {
  bucket: string;
  plays: number;
  uniquePlayers: number;
  averagePlaytimeSeconds: number | null;
}

export interface GamePlaytimeBucket {
  /** `lt_1m`, `1_5m`, `5_10m`, `10_30m`, `30_60m`, `gt_60m`. */
  key: string;
  sessions: number;
}

export interface GameAnalyticsTopGame {
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  plays: number;
  uniquePlayers: number;
  averagePlaytimeSeconds: number | null;
}

export interface MonitoringGames {
  range: string;
  from: string;
  to: string;
  generatedAt: string;
  totalGames: MonitoringCount;
  totalPlays: MonitoringCount;
  averagePlaytime: MonitoringDuration;
  activeGames: MonitoringCount;
  launchOutcomes: MonitoringUnavailable;
  trend: GamePlaysPoint[];
  playtimeDistribution: GamePlaytimeBucket[];
  topGames: GameAnalyticsTopGame[];
  categories: Array<{ name: string; plays: number }>;
  newVsReturning: { newPlayers: number; returningPlayers: number };
}

/** A ratio or percentage; `value` is null when there is nothing to divide by. */
export interface MonitoringRatio {
  value: number | null;
  changePercent: number | null;
}

/** Users are devices seen on the website or the app, including guests. */
export interface UserActivityPoint {
  bucket: string;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
}

/** Percent of users first seen 1, 7, and 30 days before `day` who were active that day. */
export interface UserRetentionPoint {
  day: string;
  d1: number | null;
  d7: number | null;
  d30: number | null;
}

/** Weekly cohort (Monday, UTC); `retention[n]` is null for weeks that have not started. */
export interface UserCohort {
  weekStart: string;
  users: number;
  retention: Array<number | null>;
}

export interface UserTopGame {
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  activeUsers: number;
  /** Percent of players who played on more than one day in the range. */
  repeatRate: number | null;
  changePercent: number | null;
}

/** `day` is ISO weekday (1 = Monday); `hour` is UTC. */
export interface UserHeatmapCell {
  day: number;
  hour: number;
  users: number;
}

export interface UserAcquisitionCohort {
  source: string;
  users: number;
  /** Percent back within 7 days; null until some users are 8+ days old. */
  returnRate: number | null;
  changePercent: number | null;
}

export interface MonitoringUsers {
  range: string;
  from: string;
  to: string;
  generatedAt: string;
  dau: MonitoringCount;
  wau: MonitoringCount;
  mau: MonitoringCount;
  retentionRate: MonitoringRatio;
  newUsers: MonitoringCount;
  activity: UserActivityPoint[];
  cohorts: UserCohort[];
  retention: UserRetentionPoint[];
  engagement: {
    gamesPerPlayer: MonitoringRatio;
    averageSessionDuration: MonitoringDuration;
    sessionsPerUser: MonitoringRatio;
    pagesPerSession: MonitoringRatio;
  };
  distribution: { new: number; returning: number; lapsed: number; inactive: number };
  topGames: UserTopGame[];
  heatmap: UserHeatmapCell[];
  acquisition: UserAcquisitionCohort[];
}

export interface GamificationPoint {
  bucket: string;
  /** Sum of positive XP awards. */
  xp: number;
  players: number;
  dailyMissions: number;
  weeklyMissions: number;
  achievements: number;
}

export interface GamificationShare {
  key: string;
  count: number;
}

export interface GamificationTopPlayer {
  userId: string;
  player: string;
  level: number;
  xp: number;
  changePercent: number | null;
}

export interface GamificationTopMission {
  title: string;
  /** `DAILY` or `WEEKLY`. */
  type: string;
  completed: number;
  assigned: number;
  completionRate: number | null;
}

export interface GamificationXpEntry {
  at: string;
  userId: string;
  player: string;
  description: string;
  /** XP event type, e.g. `GAME_SESSION_END`. */
  source: string;
  xp: number;
}

export interface GamificationRecentAchievement {
  at: string;
  userId: string;
  player: string;
  achievement: string;
  difficulty: string;
}

export interface GamificationRecentMission {
  at: string;
  userId: string;
  player: string;
  mission: string;
  type: string;
  rewardXp: number;
}

/** Seeded demo accounts are excluded; levels and streaks are current snapshots. */
export interface MonitoringGamification {
  range: string;
  from: string;
  to: string;
  generatedAt: string;
  xpAwarded: MonitoringCount;
  activePlayers: MonitoringCount;
  missionCompletions: MonitoringCount;
  achievementsUnlocked: MonitoringCount;
  activeStreaks: MonitoringCount;
  trend: GamificationPoint[];
  /** Keys: `EASY`, `MEDIUM`, `HARD`, `EPIC`, `LEGENDARY`. */
  achievementsByDifficulty: GamificationShare[];
  /** Keys: `1_5`, `6_10`, `11_15`, `16_20`, `21_30`, `31_50`, `51_plus`. */
  levels: GamificationShare[];
  /** Keys: `1_3`, `4_7`, `8_14`, `15_30`, `31_plus` (days). */
  streaks: GamificationShare[];
  missionRate: {
    completed: number;
    inProgress: number;
    notStarted: number;
    expired: number;
    completionRate: number | null;
  };
  topPlayers: GamificationTopPlayer[];
  topMissions: GamificationTopMission[];
  topAchievements: Array<{ title: string; difficulty: string; unlocks: number }>;
  recentXp: GamificationXpEntry[];
  recentAchievements: GamificationRecentAchievement[];
  recentMissions: GamificationRecentMission[];
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

export function getMonitoringGames(range: MonitoringRange, refresh = false) {
  return apiClient.get<MonitoringGames>(
    `/api/v1/admin/monitoring/games?${monitoringQuery(range, refresh)}`,
  );
}

export function getMonitoringUsers(range: MonitoringRange, refresh = false) {
  return apiClient.get<MonitoringUsers>(
    `/api/v1/admin/monitoring/users?${monitoringQuery(range, refresh)}`,
  );
}

export function getMonitoringGamification(range: MonitoringRange, refresh = false) {
  return apiClient.get<MonitoringGamification>(
    `/api/v1/admin/monitoring/gamification?${monitoringQuery(range, refresh)}`,
  );
}
