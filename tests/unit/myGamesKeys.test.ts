import { describe, expect, it } from "vitest";
import { myGamesKeys } from "@/features/my-games/api/myGamesKeys";

describe("myGamesKeys", () => {
  it("keeps user-specific favorites/history keys isolated", () => {
    expect(myGamesKeys.favorites("user-a", 1, 24)).not.toEqual(
      myGamesKeys.favorites("user-b", 1, 24),
    );
    expect(myGamesKeys.history("user-a", 1, 24)).not.toEqual(
      myGamesKeys.history("user-b", 1, 24),
    );
  });

  it("builds favorite-status keys per game", () => {
    expect(myGamesKeys.favoriteStatus("user-a", "game-1")).toEqual([
      "favorite-status",
      "user-a",
      "game-1",
    ]);
  });
});
