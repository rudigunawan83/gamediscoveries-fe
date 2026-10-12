import { describe, expect, it } from "vitest";
import { toGaEvent } from "@/lib/analytics/ga4";

describe("toGaEvent", () => {
  it("keeps a Play click distinct from a successful game load", () => {
    expect(toGaEvent("game_play_clicked", { gameId: "g1" })?.name).toBe("play_click");
    expect(toGaEvent("game_loaded", { gameId: "g1" })?.name).toBe("game_loaded");
  });

  it("forwards only allowlisted, non-empty params", () => {
    expect(
      toGaEvent("game_viewed", {
        gameId: "g1",
        gameSlug: "neon-drift",
        source: "",
        email: "someone@example.com",
        userId: "u1",
      }),
    ).toEqual({ name: "game_view", params: { game_id: "g1", game_slug: "neon-drift" } });
  });

  it("maps search to the GA4 recommended event", () => {
    expect(toGaEvent("search", { query: "racing" })).toEqual({
      name: "search",
      params: { search_term: "racing" },
    });
  });

  it("never forwards events outside the allowlist", () => {
    expect(toGaEvent("page_view", { path: "/" })).toBeNull();
    expect(toGaEvent("community_post_created", { postId: "p" })).toBeNull();
  });
});
