import { describe, expect, it } from "vitest";
import {
  formatChange,
  formatDuration,
  formatShare,
  niceScale,
} from "@/features/admin-monitoring/monitoringFormat";

describe("formatChange", () => {
  it("hides a missing baseline", () => {
    expect(formatChange(null)).toBeNull();
    expect(formatChange(undefined)).toBeNull();
  });

  it("formats a real change", () => {
    expect(formatChange(12.4)).toBe("+12.4%");
    expect(formatChange(-3)).toBe("-3.0%");
  });
});

describe("formatDuration", () => {
  it("keeps a missing duration unavailable", () => {
    expect(formatDuration(null)).toBeNull();
  });

  it("formats seconds as minutes and seconds", () => {
    expect(formatDuration(42.4)).toBe("42s");
    expect(formatDuration(185)).toBe("3m 5s");
  });
});

describe("niceScale", () => {
  it("rounds the axis up to a readable step", () => {
    expect(niceScale(37_000)).toEqual({ max: 40_000, ticks: [0, 10_000, 20_000, 30_000, 40_000] });
    expect(niceScale(9)).toEqual({ max: 12, ticks: [0, 3, 6, 9, 12] });
  });

  it("never uses fractional steps for counts", () => {
    expect(niceScale(0)).toEqual({ max: 4, ticks: [0, 1, 2, 3, 4] });
    expect(niceScale(2).ticks).toEqual([0, 1, 2, 3, 4]);
  });
});

describe("formatShare", () => {
  it("formats a share of the total", () => {
    expect(formatShare(1, 4)).toBe("25.0%");
    expect(formatShare(0, 0)).toBe("—");
  });
});
