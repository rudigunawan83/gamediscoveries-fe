import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";
import en from "../../messages/en.json";
import id from "../../messages/id.json";
import {
  formatCountdown,
  formatTimeAgo,
  formatTimeLeft,
  formatTimeUntil,
  weekdayLabels,
  type TimeTranslator,
} from "@/lib/i18n/format";

const timeT = (locale: "en" | "id"): TimeTranslator =>
  createTranslator({ locale, messages: locale === "en" ? en : id, namespace: "Time" });

describe("formatTimeAgo", () => {
  const now = Date.parse("2026-10-10T12:00:00Z");

  it("formats recent times like the app", () => {
    const t = timeT("en");
    expect(formatTimeAgo(t, "en", "2026-10-10T11:59:40Z", now)).toBe("just now");
    expect(formatTimeAgo(t, "en", "2026-10-10T11:15:00Z", now)).toBe("45m ago");
    expect(formatTimeAgo(t, "en", "2026-10-10T07:00:00Z", now)).toBe("5h ago");
    expect(formatTimeAgo(t, "en", "2026-10-07T12:00:00Z", now)).toBe("3d ago");
    expect(formatTimeAgo(t, "en", "2026-06-01T12:00:00Z", now)).toBe("Jun 1, 2026");
    expect(formatTimeAgo(t, "en", "not-a-date", now)).toBe("");
  });

  it("uses Indonesian wording and dates", () => {
    const t = timeT("id");
    expect(formatTimeAgo(t, "id", "2026-10-10T11:59:40Z", now)).toBe("baru saja");
    expect(formatTimeAgo(t, "id", "2026-10-10T07:00:00Z", now)).toBe("5 jam lalu");
    expect(formatTimeAgo(t, "id", "2026-06-01T12:00:00Z", now)).toBe("1 Jun 2026");
  });
});

describe("formatTimeUntil / formatTimeLeft", () => {
  const now = Date.parse("2026-10-10T00:00:00Z");

  it("formats days, hours and minutes like the app", () => {
    const t = timeT("en");
    expect(formatTimeLeft(t, "2026-10-11T03:00:00Z", now)).toBe("1d 3h left");
    expect(formatTimeLeft(t, "2026-10-10T02:15:00Z", now)).toBe("2h 15m left");
    expect(formatTimeLeft(t, "2026-10-10T00:09:30Z", now)).toBe("9m left");
    expect(formatTimeUntil(t, "2026-10-11T03:00:00Z", now)).toBe("1d 3h");
  });

  it("handles expired and missing dates", () => {
    const t = timeT("en");
    expect(formatTimeLeft(t, "2026-10-09T23:59:00Z", now)).toBe("Expired");
    expect(formatTimeLeft(t, null, now)).toBe("");
    expect(formatTimeLeft(t, "not-a-date", now)).toBe("");
  });

  it("uses Indonesian wording", () => {
    const t = timeT("id");
    expect(formatTimeLeft(t, "2026-10-11T03:00:00Z", now)).toBe("sisa 1 hr 3 j");
    expect(formatTimeLeft(t, "2026-10-09T23:59:00Z", now)).toBe("Berakhir");
  });
});

describe("formatCountdown", () => {
  const now = Date.parse("2026-10-10T00:00:00Z");

  it("shows days for long waits and a clock otherwise", () => {
    const t = timeT("en");
    expect(formatCountdown(t, "2026-10-11T03:00:00Z", now)).toBe("1d 3h");
    expect(formatCountdown(t, "2026-10-10T02:05:09Z", now)).toBe("02:05:09");
    expect(formatCountdown(t, "2026-10-09T23:00:00Z", now)).toBe("Resetting…");
    expect(formatCountdown(timeT("id"), "2026-10-09T23:00:00Z", now)).toBe("Mengatur ulang…");
  });
});

describe("weekdayLabels", () => {
  it("starts on Monday in the active locale", () => {
    expect(weekdayLabels("en")).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expect(weekdayLabels("id")[0]).toBe("Sen");
  });
});
