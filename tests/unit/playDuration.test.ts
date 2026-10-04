import { describe, expect, it } from "vitest";
import { calculatePlayDurationSeconds } from "@/features/game-player/utils/playDuration";

describe("calculatePlayDurationSeconds", () => {
  it("calculates whole seconds between timestamps", () => {
    const startedAt = Date.parse("2026-01-01T10:00:00.000Z");
    const endedAt = Date.parse("2026-01-01T10:03:25.000Z");
    expect(calculatePlayDurationSeconds(startedAt, endedAt)).toBe(205);
  });

  it("returns 0 when start is missing or invalid", () => {
    expect(calculatePlayDurationSeconds(null)).toBe(0);
    expect(calculatePlayDurationSeconds(0)).toBe(0);
    expect(calculatePlayDurationSeconds(2000, 1000)).toBe(0);
  });
});
