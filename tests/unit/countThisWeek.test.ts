import { describe, expect, it } from "vitest";
import { countThisWeek } from "@/features/notifications/utils/countThisWeek";

const NOW = Date.parse("2026-10-10T12:00:00Z");
const DAY = 24 * 60 * 60_000;

describe("countThisWeek", () => {
  it("counts only notifications from the last seven days", () => {
    const items = [
      { createdAt: new Date(NOW - DAY).toISOString() },
      { createdAt: new Date(NOW - 7 * DAY).toISOString() },
      { createdAt: new Date(NOW - 8 * DAY).toISOString() },
    ];
    expect(countThisWeek(items, NOW)).toBe(2);
  });

  it("ignores unparseable dates", () => {
    expect(countThisWeek([{ createdAt: "not-a-date" }], NOW)).toBe(0);
  });

  it("returns zero for an empty list", () => {
    expect(countThisWeek([], NOW)).toBe(0);
  });
});
