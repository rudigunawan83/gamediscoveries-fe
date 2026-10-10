import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

export interface CommunityUser {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  level?: number | null;
}

export interface CommunityGame {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  categories?: string[] | null;
}

export interface CommunityPost {
  id: string;
  slug: string;
  type: string;
  title: string;
  content: string;
  status: string;
  commentCount: number;
  reactionCount: number;
  viewCount: number;
  createdAt: string;
  author: CommunityUser;
  game?: CommunityGame | null;
  viewerReaction?: string | null;
}

export interface FeedItem {
  id: string;
  activityType: string;
  createdAt: string;
  user: CommunityUser;
  game?: CommunityGame | null;
  message: string;
  reactionCount: number;
  commentCount: number;
  entityId?: string | null;
  entityType?: string | null;
}

export interface CommunityHome {
  feed: FeedItem[];
  trendingDiscussions: CommunityPost[];
  popularGames: CommunityGame[];
  recentAchievements: FeedItem[];
  activeChallenges: Array<{
    id: string;
    title: string;
    description: string;
    targetValue: number;
    progress: number;
    completed: boolean;
  }>;
  topPlayers: Array<{
    rank: number;
    userId: string;
    username: string;
    displayName?: string | null;
    score: number;
  }>;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  joinedAt: string;
  gamesPlayed: number;
  favorites: number;
  achievements: number;
  reviews: number;
  followers: number;
  following: number;
  isFollowing: boolean;
  favoriteGames: CommunityGame[];
  recentAchievements: Array<{
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    unlockedAt?: string | null;
  }>;
}

export async function getCommunityHome() {
  return apiClient.get<CommunityHome>("/api/v1/community/home");
}

export async function getCommunityFeed(cursor?: string) {
  const q = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiClient.get<{ items: FeedItem[]; nextCursor?: string | null }>(
    `/api/v1/community/feed${q}`,
  );
}

export type CommunityPostSort = "latest" | "trending" | "most_liked";

export async function listCommunityPosts(params: {
  sort?: CommunityPostSort;
  q?: string;
  cursor?: string | null;
  limit?: number;
}) {
  const search = new URLSearchParams({
    sort: params.sort ?? "latest",
    limit: String(params.limit ?? 20),
  });
  if (params.q) search.set("q", params.q);
  if (params.cursor) search.set("cursor", params.cursor);
  return apiClient.get<{ items: CommunityPost[]; nextCursor?: string | null }>(
    `/api/v1/community/posts?${search.toString()}`,
  );
}

export async function getCommunityPost(id: string) {
  return apiClient.get<CommunityPost>(`/api/v1/community/posts/${id}`);
}

export async function deleteCommunityPost(id: string) {
  return apiClient.delete(`/api/v1/community/posts/${encodeURIComponent(id)}`);
}

export async function deleteComment(id: string) {
  return apiClient.delete(`/api/v1/community/comments/${encodeURIComponent(id)}`);
}

export async function removeReaction(targetType: string, targetId: string) {
  return apiClient.delete(`/api/v1/community/${targetType}/${targetId}/reactions`);
}

export async function createCommunityPost(body: {
  type: string;
  title: string;
  content: string;
  gameId?: string;
}) {
  return apiClient.post<CommunityPost>("/api/v1/community/posts", body);
}

export async function getPostComments(postId: string) {
  return apiClient.get<
    Array<{
      id: string;
      content: string;
      createdAt: string;
      author: CommunityUser;
      replies: Array<{
        id: string;
        content: string;
        createdAt: string;
        author: CommunityUser;
      }>;
    }>
  >(`/api/v1/community/posts/${postId}/comments`);
}

export async function createComment(
  postId: string,
  content: string,
  parentId?: string,
) {
  return apiClient.post(`/api/v1/community/posts/${postId}/comments`, {
    content,
    parentId,
  });
}

export async function setReaction(
  targetType: string,
  targetId: string,
  reaction: string,
) {
  return apiClient.post(
    `/api/v1/community/${targetType}/${targetId}/reactions`,
    { reaction },
  );
}

export async function getGameDiscussions(slug: string, sort = "latest") {
  return apiClient.get<CommunityPost[]>(
    `/api/v1/games/${slug}/community?sort=${encodeURIComponent(sort)}`,
  );
}

export async function getGameReviews(slug: string) {
  return apiClient.get<{
    summary: { averageRating: number; reviewCount: number };
    items: Array<{
      id: string;
      rating: number;
      content: string;
      createdAt: string;
      author: CommunityUser;
    }>;
  }>(`/api/v1/games/${slug}/reviews`);
}

export async function createReport(body: {
  targetType: string;
  targetId: string;
  reason: string;
  description?: string;
}) {
  return apiClient.post("/api/v1/community/reports", body);
}

export async function blockUser(userId: string) {
  return apiClient.post(`/api/v1/users/${userId}/block`, {});
}

export async function unblockUser(userId: string) {
  return apiClient.delete(`/api/v1/users/${userId}/block`);
}

export async function listAdminReports(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiClient.get<
    Array<{
      id: string;
      targetType: string;
      targetId: string;
      reason: string;
      status: string;
      createdAt: string;
    }>
  >(`/api/v1/admin/community/reports${q}`);
}

export async function moderateCommunity(body: {
  action: string;
  targetType: string;
  targetId: string;
  resolution?: string;
}) {
  return apiClient.post("/api/v1/admin/community/moderate", body);
}

export async function upsertGameReview(
  slug: string,
  rating: number,
  content: string,
) {
  return apiClient.post(`/api/v1/games/${slug}/reviews`, { rating, content });
}

export interface MyReview {
  id: string;
  rating: number;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  game: CommunityGame;
}

export async function getMyReviews() {
  return apiClient.get<MyReview[]>("/api/v1/users/me/reviews");
}

export async function deleteReview(id: string) {
  return apiClient.delete(`/api/v1/reviews/${encodeURIComponent(id)}`);
}

export interface PrivacySettings {
  showFavorites: boolean;
  showHistory: boolean;
  showAchievements: boolean;
  showActivity: boolean;
  showOnLeaderboards: boolean;
  bio?: string | null;
}

export type PrivacyOption = Exclude<keyof PrivacySettings, "bio">;

export async function getPrivacySettings() {
  return apiClient.get<PrivacySettings>("/api/v1/users/me/privacy");
}

/** The API only changes the fields that are sent. */
export async function updatePrivacySetting(option: PrivacyOption, value: boolean) {
  return apiClient.put("/api/v1/users/me/privacy", { [option]: value });
}

export async function getUserProfile(username: string) {
  return apiClient.get<UserProfile>(`/api/v1/users/${username}/profile`);
}

export async function followUser(userId: string) {
  return apiClient.post(`/api/v1/users/${userId}/follow`, {});
}

export async function unfollowUser(userId: string) {
  return apiClient.delete(`/api/v1/users/${userId}/follow`);
}

export async function getAchievements() {
  return apiClient.get("/api/v1/community/achievements");
}

export async function getChallenges() {
  return apiClient.get("/api/v1/community/challenges");
}

export async function getLeaderboards(type = "players", period = "weekly") {
  return apiClient.get(
    `/api/v1/community/leaderboards?type=${type}&period=${period}`,
  );
}

export async function getNotifications() {
  return apiClient.get<{
    items: Array<{
      id: string;
      type: string;
      message?: string;
      entityType?: string | null;
      entityId?: string | null;
      createdAt: string;
      readAt?: string | null;
    }>;
    unread: number;
  }>("/api/v1/community/notifications");
}

export async function markNotificationsRead(notificationId?: string) {
  return apiClient.post("/api/v1/community/notifications/read", {
    notificationId,
  });
}

export type { ApiResponse };
