import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchHistory,
  recordHistory,
} from "@/features/my-games/api/historyApi";
import { apiClient } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("historyApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists history from the authenticated endpoint", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: [
        {
          id: "h1",
          gameId: "g1",
          playedAt: "2026-10-04T10:00:00Z",
          durationSeconds: 120,
          game: {
            id: "g1",
            slug: "puzzle-one",
            title: "Puzzle One",
            mobileReady: true,
          },
        },
      ],
      error: null,
      meta: { page: 1, pageSize: 24, total: 1, totalPages: 1 },
    });

    const result = await fetchHistory({ page: 1, pageSize: 24 });
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/users/me/history?page=1&pageSize=24",
    );
    expect(result.items[0]?.durationSeconds).toBe(120);
  });

  it("records history sessions", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      data: { recorded: true },
      error: null,
      meta: null,
    });

    await recordHistory({ gameId: "g1", durationSeconds: 45 });
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/users/me/history", {
      gameId: "g1",
      durationSeconds: 45,
    });
  });
});
