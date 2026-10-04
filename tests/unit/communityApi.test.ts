import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCommunityPost,
  followUser,
  getCommunityHome,
  getGameReviews,
  unfollowUser,
} from "@/lib/api/community";
import { apiClient } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("communityApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads community home", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: {
        feed: [],
        trendingDiscussions: [],
        popularGames: [],
        recentAchievements: [],
        activeChallenges: [],
        topPlayers: [],
      },
      error: null,
      meta: null,
    });

    const result = await getCommunityHome();
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/community/home");
    expect(result.data.feed).toEqual([]);
  });

  it("creates a community post", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      data: { id: "p1" },
      error: null,
      meta: null,
    });

    await createCommunityPost({
      type: "discussion",
      title: "Worth playing?",
      content: "Looks fun",
    });

    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/community/posts", {
      type: "discussion",
      title: "Worth playing?",
      content: "Looks fun",
    });
  });

  it("loads game reviews", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: {
        summary: { averageRating: 4.4, reviewCount: 12 },
        items: [],
      },
      error: null,
      meta: null,
    });

    const result = await getGameReviews("super-game");
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/games/super-game/reviews",
    );
    expect(result.data.summary.averageRating).toBe(4.4);
  });

  it("follows and unfollows users", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      data: { following: true },
      error: null,
      meta: null,
    });
    vi.mocked(apiClient.delete).mockResolvedValue({
      success: true,
      data: { following: false },
      error: null,
      meta: null,
    });

    await followUser("u1");
    await unfollowUser("u1");

    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/users/u1/follow", {});
    expect(apiClient.delete).toHaveBeenCalledWith("/api/v1/users/u1/follow");
  });
});
