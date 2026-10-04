import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addFavorite,
  checkFavorite,
  fetchFavorites,
  removeFavorite,
} from "@/features/my-games/api/favoritesApi";
import { apiClient } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("favoritesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists favorites from the authenticated endpoint", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: [
        {
          gameId: "g1",
          favoritedAt: "2026-10-01T00:00:00Z",
          game: {
            id: "g1",
            slug: "racing-one",
            title: "Racing One",
            mobileReady: true,
          },
        },
      ],
      error: null,
      meta: { page: 1, pageSize: 24, total: 1, totalPages: 1 },
    });

    const result = await fetchFavorites({ page: 1, pageSize: 24 });
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/users/me/favorites?page=1&pageSize=24",
    );
    expect(result.items[0]?.game.slug).toBe("racing-one");
  });

  it("posts and deletes favorites", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      data: { favorited: true },
      error: null,
      meta: null,
    });
    vi.mocked(apiClient.delete).mockResolvedValue({
      success: true,
      data: { removed: true },
      error: null,
      meta: null,
    });

    await addFavorite("g1");
    await removeFavorite("g1");

    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/users/me/favorites", {
      gameId: "g1",
    });
    expect(apiClient.delete).toHaveBeenCalledWith(
      "/api/v1/users/me/favorites/g1",
    );
  });

  it("checks favorite status", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: { favorited: true },
      error: null,
      meta: null,
    });

    await expect(checkFavorite("g1")).resolves.toBe(true);
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/users/me/favorites/g1",
    );
  });
});
