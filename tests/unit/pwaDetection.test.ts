import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getDisplayMode, isAppleBrowser, isStandalone } from "@/lib/pwa/detection";
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

describe("apple browser detection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const userAgents: Array<[string, string, boolean]> = [
    [
      "iPhone Safari",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      true,
    ],
    [
      "Chrome on iPhone",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.0.0 Mobile/15E148 Safari/604.1",
      true,
    ],
    [
      "Safari on a Mac or iPad",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      true,
    ],
    [
      "Chrome on Android",
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
      false,
    ],
    [
      "Samsung Internet",
      "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36",
      false,
    ],
    [
      "Chrome on Windows",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      false,
    ],
  ];

  it.each(userAgents)("%s", (_name, userAgent, expected) => {
    vi.stubGlobal("navigator", { userAgent });
    expect(isAppleBrowser()).toBe(expected);
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
