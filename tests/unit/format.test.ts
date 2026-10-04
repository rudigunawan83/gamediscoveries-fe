import { describe, expect, it } from "vitest";
import { formatPlayCount, formatRating } from "@/lib/utils/format";

describe("formatPlayCount", () => {
  it("formats thousands and millions", () => {
    expect(formatPlayCount(950)).toBe("950");
    expect(formatPlayCount(1500)).toBe("1.5K");
    expect(formatPlayCount(2_500_000)).toBe("2.5M");
  });

  it("handles missing values", () => {
    expect(formatPlayCount(undefined)).toBe("—");
  });
});

describe("formatRating", () => {
  it("formats rating to one decimal", () => {
    expect(formatRating(4.8)).toBe("4.8");
    expect(formatRating(undefined)).toBe("N/A");
  });
});
