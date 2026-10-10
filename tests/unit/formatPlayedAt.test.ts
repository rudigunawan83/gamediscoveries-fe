import { describe, expect, it, vi, afterEach } from "vitest";
import { formatPlayedAt } from "@/features/my-games/utils/formatPlayedAt";
import { historyFormatter } from "./helpers/intl";

describe("formatPlayedAt", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats today as relative time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-04T12:00:00.000Z"));
    expect(formatPlayedAt(historyFormatter(), "2026-10-04T11:40:00.000Z")).toBe(
      "Played 20m ago",
    );
    expect(formatPlayedAt(historyFormatter("id"), "2026-10-04T11:40:00.000Z")).toBe(
      "Dimainkan 20 mnt lalu",
    );
  });

  it("formats yesterday explicitly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-04T12:00:00.000Z"));
    expect(formatPlayedAt(historyFormatter(), "2026-10-03T12:00:00.000Z")).toBe(
      "Played yesterday",
    );
    expect(formatPlayedAt(historyFormatter("id"), "2026-10-03T12:00:00.000Z")).toBe(
      "Dimainkan kemarin",
    );
  });

  it("handles invalid dates safely", () => {
    expect(formatPlayedAt(historyFormatter(), "not-a-date")).toBe("Recently played");
  });
});
