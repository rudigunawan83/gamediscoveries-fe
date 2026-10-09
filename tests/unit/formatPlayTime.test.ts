import { describe, expect, it } from "vitest";
import type { HistoryItem } from "@/features/my-games/types/my-games.types";
import {
  formatHistoryMeta,
  formatPlatform,
  formatPlayTime,
} from "@/features/my-games/utils/formatPlayTime";
import { mockGames } from "@/features/games/mock/games.mock";

function item(overrides: Partial<HistoryItem>): HistoryItem {
  return {
    id: "h1",
    gameId: "g1",
    playedAt: new Date().toISOString(),
    durationSeconds: 0,
    totalPlaySeconds: 0,
    playCount: 0,
    lastPlatform: null,
    game: mockGames[0],
    ...overrides,
  };
}

describe("formatPlayTime", () => {
  it("formats minutes and hours", () => {
    expect(formatPlayTime(0)).toBe("<1m");
    expect(formatPlayTime(59)).toBe("<1m");
    expect(formatPlayTime(720)).toBe("12m");
    expect(formatPlayTime(3600)).toBe("1h");
    expect(formatPlayTime(3900)).toBe("1h 5m");
  });

  it("labels known platforms only", () => {
    expect(formatPlatform("ANDROID")).toBe("Android");
    expect(formatPlatform("IOS")).toBe("iOS");
    expect(formatPlatform("WEB")).toBe("Web");
    expect(formatPlatform(null)).toBeNull();
    expect(formatPlatform("TV")).toBeNull();
  });

  it("prefers the server total and shows the last platform", () => {
    const meta = formatHistoryMeta(
      item({ totalPlaySeconds: 3900, durationSeconds: 60, lastPlatform: "ANDROID" }),
    );
    expect(meta).toMatch(/ on Android · 1h 5m total$/);
  });

  it("falls back to session duration without platform", () => {
    const meta = formatHistoryMeta(item({ durationSeconds: 120 }));
    expect(meta).not.toContain(" on ");
    expect(meta).toMatch(/· 2m total$/);
  });
});
