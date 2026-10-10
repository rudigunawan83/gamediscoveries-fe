import { describe, expect, it } from "vitest";
import { Car, Clock, Compass, Flame, Gamepad2, Heart, Puzzle, Trophy } from "lucide-react";
import { isGameDetailPath, isMobileFullScreenPath } from "@/components/navigation/nav-config";
import type { HistoryItem } from "@/features/my-games/types/my-games.types";
import { categoryIcon } from "@/features/mobile-tabs/components/MobileDiscover";
import { formatTimeAgo } from "@/features/mobile-tabs/components/MobileGameDetail";
import {
  achievementColor,
  achievementIcon,
  humanizeCode,
} from "@/features/mobile-tabs/components/MobileGamification";
import { leaderboardName, leaderboardSubtitle } from "@/features/mobile-tabs/components/MobileLeaderboard";
import { historySubtitle } from "@/features/mobile-tabs/components/MobileLibrary";
import { HELP_FAQS, PRIVACY_LABELS } from "@/features/mobile-tabs/components/MobileAccount";
import { communityName, sectionLabel, withReaction } from "@/features/mobile-tabs/components/MobileCommunityUi";
import {
  notificationCategory,
  notificationRoute,
  notificationTitle,
} from "@/features/mobile-tabs/components/MobileNotifications";
import { toggleInSavedList } from "@/features/mobile-tabs/lib/savedCommunityPosts";
import type { CommunityPost } from "@/lib/api/community";
import { formatRemaining, missionVisual } from "@/features/mobile-tabs/components/MobileMissions";
import type { LeaderboardItemDto } from "@/lib/api/leaderboards";
import type { Game } from "@/types/game";

describe("formatRemaining", () => {
  const now = Date.parse("2026-10-10T00:00:00Z");

  it("formats days, hours and minutes like the app", () => {
    expect(formatRemaining("2026-10-11T03:00:00Z", now)).toBe("1d 3h left");
    expect(formatRemaining("2026-10-10T02:15:00Z", now)).toBe("2h 15m left");
    expect(formatRemaining("2026-10-10T00:09:30Z", now)).toBe("9m left");
  });

  it("handles expired and missing dates", () => {
    expect(formatRemaining("2026-10-09T23:59:00Z", now)).toBe("Expired");
    expect(formatRemaining(null, now)).toBe("");
    expect(formatRemaining("not-a-date", now)).toBe("");
  });
});

describe("missionVisual", () => {
  it("maps requirement types to icons", () => {
    expect(missionVisual("ADD_FAVORITE")[0]).toBe(Heart);
    expect(missionVisual("PLAY_GAMES")[0]).toBe(Gamepad2);
    expect(missionVisual("PLAY_MINUTES")[0]).toBe(Clock);
  });
});

describe("isGameDetailPath", () => {
  it("matches only the game detail page", () => {
    expect(isGameDetailPath("/game/2244-number-match")).toBe(true);
    expect(isGameDetailPath("/game/2244-number-match/")).toBe(true);
    expect(isGameDetailPath("/game/2244-number-match/play")).toBe(false);
    expect(isGameDetailPath("/game/2244-number-match/community")).toBe(false);
    expect(isGameDetailPath("/games/puzzle")).toBe(false);
  });
});

describe("formatTimeAgo", () => {
  const now = Date.parse("2026-10-10T12:00:00Z");

  it("formats recent times like the app", () => {
    expect(formatTimeAgo("2026-10-10T11:59:40Z", now)).toBe("just now");
    expect(formatTimeAgo("2026-10-10T11:15:00Z", now)).toBe("45m ago");
    expect(formatTimeAgo("2026-10-10T07:00:00Z", now)).toBe("5h ago");
    expect(formatTimeAgo("2026-10-07T12:00:00Z", now)).toBe("3d ago");
    expect(formatTimeAgo("2026-06-01T12:00:00Z", now)).toBe("1 Jun 2026");
  });
});

describe("isMobileFullScreenPath", () => {
  it("covers game detail and the app's pushed screens", () => {
    expect(isMobileFullScreenPath("/game/2244-number-match")).toBe(true);
    expect(isMobileFullScreenPath("/favorites")).toBe(true);
    expect(isMobileFullScreenPath("/history/")).toBe(true);
    expect(isMobileFullScreenPath("/leaderboard")).toBe(true);
    expect(isMobileFullScreenPath("/progress/xp")).toBe(false);
    expect(isMobileFullScreenPath("/profile")).toBe(false);
    expect(isMobileFullScreenPath("/")).toBe(false);
  });
});

describe("achievement visuals", () => {
  it("maps difficulty to the app's badge colors", () => {
    expect(achievementColor("bronze")).toBe("#d08a4e");
    expect(achievementColor("RARE")).toBe("#ffc83d");
    expect(achievementColor("LEGENDARY")).toBe("#8b5cf6");
    expect(achievementColor("other")).toBe("#3b82f6");
  });

  it("maps categories to icons", () => {
    expect(achievementIcon("DAILY_STREAK")).toBe(Flame);
    expect(achievementIcon("EXPLORATION")).toBe(Compass);
    expect(achievementIcon("GAMEPLAY")).toBe(Gamepad2);
    expect(achievementIcon("MISC")).toBe(Trophy);
  });

  it("humanizes codes", () => {
    expect(humanizeCode("DAILY_STREAK")).toBe("Daily Streak");
    expect(humanizeCode("first game played")).toBe("First Game Played");
  });
});

describe("leaderboard rows", () => {
  const entry = (user: Partial<LeaderboardItemDto["user"]>, gamesPlayed = 4) =>
    ({ rank: 4, score: 1200, gamesPlayed, validSessions: 0, xpEarned: 0, user: { id: "u1", ...user } }) as LeaderboardItemDto;

  it("prefers display name, then username", () => {
    expect(leaderboardName(entry({ displayName: "Ana", username: "ana" }))).toBe("Ana");
    expect(leaderboardName(entry({ username: "ana" }))).toBe("ana");
    expect(leaderboardName(entry({}))).toBe("Player");
  });

  it("shows level when known, else games played", () => {
    expect(leaderboardSubtitle(entry({ level: 7 }))).toBe("Lv 7");
    expect(leaderboardSubtitle(entry({ level: null }, 12))).toBe("12 games played");
  });
});

describe("historySubtitle", () => {
  const item = (playCount: number) =>
    ({
      id: "h1",
      gameId: "g1",
      playedAt: "2026-10-10T11:00:00Z",
      durationSeconds: 0,
      totalPlaySeconds: 0,
      playCount,
      lastPlatform: null,
      game: {} as Game,
    }) satisfies HistoryItem;

  it("adds the play count only for repeat plays", () => {
    expect(historySubtitle(item(3))).toMatch(/ · 3 plays$/);
    expect(historySubtitle(item(1))).not.toMatch(/plays$/);
  });
});

describe("community helpers", () => {
  const post = (id: string, extra: Partial<CommunityPost> = {}) =>
    ({
      id,
      slug: id,
      type: "discussion",
      title: "T",
      content: "C",
      status: "published",
      commentCount: 0,
      reactionCount: 2,
      viewCount: 0,
      createdAt: "2026-10-10T00:00:00Z",
      author: { id: "u1", username: "ana" },
      ...extra,
    }) satisfies CommunityPost;

  it("labels sections like the app", () => {
    expect(sectionLabel("discussion")).toBe("Discussions");
    expect(sectionLabel("game_share")).toBe("Game Shares");
    expect(sectionLabel("weekly_poll")).toBe("Weekly poll");
    expect(sectionLabel(null)).toBe("");
  });

  it("prefers display name over username", () => {
    expect(communityName({ id: "1", username: "ana", displayName: "Ana" })).toBe("Ana");
    expect(communityName({ id: "1", username: "ana", displayName: " " })).toBe("ana");
  });

  it("adjusts the like count when toggling", () => {
    const liked = withReaction(post("p1"), "like");
    expect(liked).toMatchObject({ viewerReaction: "like", reactionCount: 3 });
    expect(withReaction(liked, null)).toMatchObject({ viewerReaction: null, reactionCount: 2 });
    expect(withReaction(post("p2", { reactionCount: 0, viewerReaction: "like" }), null).reactionCount).toBe(0);
  });

  it("toggles saved posts newest first with a cap", () => {
    const list = [post("a"), post("b")];
    expect(toggleInSavedList(list, post("c")).map((p) => p.id)).toEqual(["c", "a", "b"]);
    expect(toggleInSavedList(list, post("a")).map((p) => p.id)).toEqual(["b"]);
    expect(toggleInSavedList(list, post("c"), 2).map((p) => p.id)).toEqual(["c", "a"]);
  });
});

describe("notifications", () => {
  it("groups types into the app's categories", () => {
    expect(notificationCategory("ACHIEVEMENT_UNLOCKED")).toBe("achievement");
    expect(notificationCategory("challenge_completed")).toBe("mission");
    expect(notificationCategory("comment_reply")).toBe("social");
    expect(notificationCategory("system")).toBe("other");
  });

  it("builds titles and routes", () => {
    expect(notificationTitle("comment_reply")).toBe("Comment Reply");
    expect(notificationTitle("")).toBe("Notification");
    expect(notificationRoute({ type: "comment", entityType: "post", entityId: "p1" })).toBe("/community/post/p1");
    expect(notificationRoute({ type: "x", entityType: "achievement" })).toBe("/achievements");
    expect(notificationRoute({ type: "mission_done", entityType: "user" })).toBe("/missions");
    expect(notificationRoute({ type: "follow", entityType: "user" })).toBeNull();
  });

  it("treats community screens as full screen", () => {
    expect(isMobileFullScreenPath("/community")).toBe(true);
    expect(isMobileFullScreenPath("/community/post/abc")).toBe(true);
    expect(isMobileFullScreenPath("/community/challenges")).toBe(false);
  });
});

describe("account screens", () => {
  it("are full screen on phones", () => {
    expect(isMobileFullScreenPath("/settings")).toBe(true);
    expect(isMobileFullScreenPath("/help/")).toBe(true);
    expect(isMobileFullScreenPath("/my-reviews")).toBe(true);
  });

  it("labels every privacy option sent to the API", () => {
    expect(Object.keys(PRIVACY_LABELS).sort()).toEqual(
      ["showAchievements", "showActivity", "showFavorites", "showHistory", "showOnLeaderboards"],
    );
    expect(HELP_FAQS.length).toBeGreaterThan(0);
  });
});

describe("categoryIcon", () => {
  it("picks an icon by slug", () => {
    expect(categoryIcon("puzzle")).toBe(Puzzle);
    expect(categoryIcon("racing-games")).toBe(Car);
    expect(categoryIcon("unknown")).toBe(Gamepad2);
  });
});
