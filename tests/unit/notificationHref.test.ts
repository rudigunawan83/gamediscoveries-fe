import { describe, expect, it } from "vitest";
import { notificationHref } from "@/features/notifications/utils/notificationHref";

describe("notificationHref", () => {
  it("opens the post for post notifications", () => {
    expect(
      notificationHref({ type: "comment_on_post", entityType: "post", entityId: "p1" }),
    ).toBe("/community/post/p1");
  });

  it("opens achievements, missions and leaderboards by category", () => {
    expect(
      notificationHref({ type: "achievement_unlocked", entityType: "achievement", entityId: "a1" }),
    ).toBe("/community/achievements");
    expect(notificationHref({ type: "MISSION_COMPLETED" })).toBe("/missions");
    expect(notificationHref({ type: "LEADERBOARD_RANK_CHANGED" })).toBe("/community/leaderboards");
  });

  it("has no destination for comment replies or follows", () => {
    expect(
      notificationHref({ type: "reply_to_comment", entityType: "comment", entityId: "c1" }),
    ).toBeNull();
    expect(
      notificationHref({ type: "user_followed", entityType: "user", entityId: "u1" }),
    ).toBeNull();
  });
});
