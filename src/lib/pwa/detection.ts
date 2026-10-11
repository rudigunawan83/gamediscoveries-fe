export type DisplayMode = "browser" | "standalone" | "minimal-ui" | "fullscreen";

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;

  const mediaStandalone = window.matchMedia?.(
    "(display-mode: standalone)",
  ).matches;
  const mediaFullscreen = window.matchMedia?.(
    "(display-mode: fullscreen)",
  ).matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return Boolean(mediaStandalone || mediaFullscreen || iosStandalone);
}

export function getDisplayMode(): DisplayMode {
  if (typeof window === "undefined") return "browser";
  if (window.matchMedia?.("(display-mode: fullscreen)").matches) {
    return "fullscreen";
  }
  if (isStandalone()) return "standalone";
  if (window.matchMedia?.("(display-mode: minimal-ui)").matches) {
    return "minimal-ui";
  }
  return "browser";
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Desktop or mobile Safari; Chromium and Firefox builds also say "Safari/". */
export function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|Edg\/|OPR\/|SamsungBrowser|Android/.test(ua);
}

/** The Android APK is useless here: iOS devices (iPadOS reports as a Mac) or Safari. */
export function isAppleBrowser(): boolean {
  return isIos() || isSafari();
}
