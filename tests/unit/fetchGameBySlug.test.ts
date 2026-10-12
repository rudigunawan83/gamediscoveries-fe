import { describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api/types";

let failWith: ApiClientError;
vi.mock("@/lib/api/games", () => ({
  getGameBySlug: async () => {
    throw failWith;
  },
  getGames: vi.fn(),
  getHomeDiscoveries: vi.fn(),
}));

const { fetchGameBySlug } = await import("@/features/games/api/games.api");

async function outcome(slug: string, status: number) {
  failWith = new ApiClientError("api", status);
  try {
    return { value: await fetchGameBySlug(slug) };
  } catch (error) {
    return { error };
  }
}

describe("fetchGameBySlug", () => {
  it.each([400, 404, 422])("treats %i as a missing game", async (status) => {
    expect(await outcome(`missing-${status}`, status)).toEqual({ value: null });
  });

  it.each([0, 408, 429, 500, 503])("rethrows %i so outages are not served as 404", async (status) => {
    const result = await outcome(`down-${status}`, status);
    expect(result.error).toBeInstanceOf(ApiClientError);
  });
});
