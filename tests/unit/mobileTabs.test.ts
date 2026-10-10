import { describe, expect, it } from "vitest";
import { Car, Clock, Compass, Flame, Gamepad2, Heart, Puzzle, Trophy } from "lucide-react";
import { isGameDetailPath, isMobileFullScreenPath } from "@/components/navigation/nav-config";
import type { HistoryItem } from "@/features/my-games/types/my-games.types";
import { categoryIcon } from "@/features/mobile-tabs/components/MobileDiscover";
import {
  achievementColor,
  achievementIcon,
  humanizeCode,
} from "@/features/mobile-tabs/components/MobileGamification";
import { leaderboardName, leaderboardSubtitle } from "@/features/mobile-tabs/components/MobileLeaderboard";
import { historySubtitle } from "@/features/mobile-tabs/components/MobileLibrary";
import { HELP_FAQS, PRIVACY_LABELS } from "@/features/mobile-tabs/components/MobileAccount";
import {
  communityName,
  errorMessage,
  sectionLabel,
  withReaction,
} from "@/features/mobile-tabs/components/MobileCommunityUi";
import { REQUEST_FAILED_MESSAGE } from "@/lib/api/client";
import { ApiClientError } from "@/lib/api/types";
import {
  notificationCategory,
  notificationRoute,
  notificationTitle,
} from "@/features/mobile-tabs/components/MobileNotifications";
import { toggleInSavedList } from "@/features/mobile-tabs/lib/savedCommunityPosts";
import type { CommunityPost } from "@/lib/api/community";
import { missionVisual } from "@/features/mobile-tabs/components/MobileMissions";
import type { LeaderboardItemDto } from "@/lib/api/leaderboards";
import type { Game } from "@/types/game";
import {
  communityTranslator,
  gamificationTranslator,
  historyFormatter,
  notificationsTranslator,
} from "./helpers/intl";

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
    expect(leaderboardName(entry({ displayName: "Ana", username: "ana" }), "Player")).toBe("Ana");
    expect(leaderboardName(entry({ username: "ana" }), "Player")).toBe("ana");
    expect(leaderboardName(entry({}), "Pemain")).toBe("Pemain");
  });

  it("shows level when known, else games played", () => {
    const t = gamificationTranslator();
    expect(leaderboardSubtitle(t, entry({ level: 7 }))).toBe("Lv 7");
    expect(leaderboardSubtitle(t, entry({ level: null }, 12))).toBe("12 games played");
    expect(leaderboardSubtitle(t, entry({ level: null }, 1))).toBe("1 game played");
    expect(leaderboardSubtitle(gamificationTranslator("id"), entry({ level: null }, 12))).toBe(
      "12 game dimainkan",
    );
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
    expect(historySubtitle(historyFormatter(), item(3))).toMatch(/ · 3 plays$/);
    expect(historySubtitle(historyFormatter(), item(1))).not.toMatch(/play$/);
    expect(historySubtitle(historyFormatter("id"), item(3))).toMatch(/ · 3 kali main$/);
  });
});

describe("errorMessage", () => {
  it("keeps server messages but hides client-generated English errors", () => {
    expect(errorMessage(new ApiClientError("Post not found", 404), "Gagal")).toBe("Post not found");
    expect(errorMessage(new ApiClientError("Request timed out", 408), "Gagal")).toBe("Gagal");
    expect(errorMessage(new ApiClientError("Failed to fetch", 0), "Gagal")).toBe("Gagal");
    expect(errorMessage(new ApiClientError(REQUEST_FAILED_MESSAGE, 502), "Gagal")).toBe("Gagal");
    expect(errorMessage("oops", "Gagal")).toBe("Gagal");
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
    const t = communityTranslator();
    expect(sectionLabel(t, "discussion")).toBe("Discussions");
    expect(sectionLabel(t, "game_share")).toBe("Game Shares");
    expect(sectionLabel(t, "weekly_poll")).toBe("Weekly poll");
    expect(sectionLabel(t, null)).toBe("");
  });

  it("labels known sections in Indonesian", () => {
    const t = communityTranslator("id");
    expect(sectionLabel(t, "discussion")).toBe("Diskusi");
    expect(sectionLabel(t, "game_share")).toBe("Berbagi Game");
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
    const t = notificationsTranslator();
    expect(notificationTitle(t, "comment_reply")).toBe("Comment Reply");
    expect(notificationTitle(t, "")).toBe("Notification");
    expect(notificationTitle(t, "reply_to_comment")).toBe("New Reply");
    const tId = notificationsTranslator("id");
    expect(notificationTitle(tId, "reply_to_comment")).toBe("Balasan Baru");
    expect(notificationTitle(tId, "")).toBe("Notifikasi");
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
