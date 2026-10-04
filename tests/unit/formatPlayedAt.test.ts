import { describe, expect, it, vi, afterEach } from "vitest";
import { formatPlayedAt } from "@/features/my-games/utils/formatPlayedAt";

describe("formatPlayedAt", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats today as relative time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-04T12:00:00.000Z"));
    expect(formatPlayedAt("2026-10-04T11:40:00.000Z")).toMatch(/Played .+ ago/);
  });

  it("formats yesterday explicitly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-04T12:00:00.000Z"));
    expect(formatPlayedAt("2026-10-03T12:00:00.000Z")).toBe("Played yesterday");
  });

  it("handles invalid dates safely", () => {
    expect(formatPlayedAt("not-a-date")).toBe("Recently played");
  });
});
