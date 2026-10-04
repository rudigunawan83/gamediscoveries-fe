import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getDisplayMode, isStandalone } from "@/lib/pwa/detection";
import {
  PWA_ENGAGEMENT,
  isDismissedRecently,
  shouldShowInstallUi,
} from "@/lib/pwa/install";

describe("pwa detection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("standalone"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects standalone display mode", () => {
    expect(isStandalone()).toBe(true);
    expect(getDisplayMode()).toBe("standalone");
  });
});

describe("pwa install engagement", () => {
  it("hides install UI when already installed or dismissed", () => {
    expect(
      shouldShowInstallUi({
        installed: true,
        dismissed: false,
        pageViews: 5,
        sessionMs: 60_000,
        hasPlayed: true,
        canPrompt: true,
        isIos: false,
      }),
    ).toBe(false);
  });

  it("requires engagement before showing install UI", () => {
    expect(
      shouldShowInstallUi({
        installed: false,
        dismissed: false,
        pageViews: 1,
        sessionMs: 1_000,
        hasPlayed: false,
        canPrompt: true,
        isIos: false,
      }),
    ).toBe(false);

    expect(
      shouldShowInstallUi({
        installed: false,
        dismissed: false,
        pageViews: PWA_ENGAGEMENT.minPageViews,
        sessionMs: 1_000,
        hasPlayed: false,
        canPrompt: true,
        isIos: false,
      }),
    ).toBe(true);
  });

  it("respects dismissal TTL helper", () => {
    const now = Date.now();
    window.localStorage.setItem("pwa_install_dismissed_at", String(now));
    expect(isDismissedRecently(now + 1_000)).toBe(true);
    expect(
      isDismissedRecently(now + PWA_ENGAGEMENT.dismissCooldownMs + 1),
    ).toBe(false);
    window.localStorage.removeItem("pwa_install_dismissed_at");
  });
});
