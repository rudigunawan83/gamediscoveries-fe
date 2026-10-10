import { describe, expect, it } from "vitest";
import type { HistoryItem } from "@/features/my-games/types/my-games.types";
import {
  formatHistoryMeta,
  formatPlatform,
  formatPlayTime,
} from "@/features/my-games/utils/formatPlayTime";
import { mockGames } from "@/features/games/mock/games.mock";
import { historyFormatter } from "./helpers/intl";

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
    const { time } = historyFormatter();
    expect(formatPlayTime(time, 0)).toBe("<1m");
    expect(formatPlayTime(time, 59)).toBe("<1m");
    expect(formatPlayTime(time, 720)).toBe("12m");
    expect(formatPlayTime(time, 3600)).toBe("1h");
    expect(formatPlayTime(time, 3900)).toBe("1h 5m");
  });

  it("uses Indonesian units", () => {
    const { time } = historyFormatter("id");
    expect(formatPlayTime(time, 30)).toBe("<1 mnt");
    expect(formatPlayTime(time, 3900)).toBe("1 j 5 mnt");
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
      historyFormatter(),
      item({ totalPlaySeconds: 3900, durationSeconds: 60, lastPlatform: "ANDROID" }),
    );
    expect(meta).toMatch(/ on Android · 1h 5m total$/);
  });

  it("falls back to session duration without platform", () => {
    const meta = formatHistoryMeta(historyFormatter(), item({ durationSeconds: 120 }));
    expect(meta).not.toContain(" on ");
    expect(meta).toMatch(/· 2m total$/);
  });

  it("localizes the meta line", () => {
    const meta = formatHistoryMeta(
      historyFormatter("id"),
      item({ totalPlaySeconds: 3900, lastPlatform: "ANDROID" }),
    );
    expect(meta).toMatch(/^Dimainkan .+ di Android · total 1 j 5 mnt$/);
  });
});
