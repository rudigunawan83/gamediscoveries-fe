import { describe, expect, it } from "vitest";
import { Car, Clock, Gamepad2, Heart, Puzzle } from "lucide-react";
import { categoryIcon } from "@/features/mobile-tabs/components/MobileDiscover";
import { formatRemaining, missionVisual } from "@/features/mobile-tabs/components/MobileMissions";

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

describe("categoryIcon", () => {
  it("picks an icon by slug", () => {
    expect(categoryIcon("puzzle")).toBe(Puzzle);
    expect(categoryIcon("racing-games")).toBe(Car);
    expect(categoryIcon("unknown")).toBe(Gamepad2);
  });
});
