export const PWA_DISMISS_KEY = "pwa_install_dismissed_at";
export const PWA_PAGE_VIEWS_KEY = "pwa_page_views";
export const PWA_PLAYED_KEY = "pwa_has_played";

export type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

/** Engagement thresholds before showing install UI. */
export const PWA_ENGAGEMENT = {
  minPageViews: 2,
  minSessionMs: 20_000,
  dismissCooldownMs: 7 * 24 * 60 * 60 * 1000,
} as const;

export function getDismissedAt(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PWA_DISMISS_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function setDismissedNow(): void {
  window.localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
}

export function clearDismissed(): void {
  window.localStorage.removeItem(PWA_DISMISS_KEY);
}

export function isDismissedRecently(
  now = Date.now(),
  ttlMs = PWA_ENGAGEMENT.dismissCooldownMs,
): boolean {
  const at = getDismissedAt();
  if (at == null) return false;
  return now - at < ttlMs;
}

export function incrementPageViews(): number {
  if (typeof window === "undefined") return 0;
  const next = Number(window.sessionStorage.getItem(PWA_PAGE_VIEWS_KEY) ?? "0") + 1;
  window.sessionStorage.setItem(PWA_PAGE_VIEWS_KEY, String(next));
  return next;
}

export function getPageViews(): number {
  if (typeof window === "undefined") return 0;
  return Number(window.sessionStorage.getItem(PWA_PAGE_VIEWS_KEY) ?? "0");
}

export function markPlayed(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PWA_PLAYED_KEY, "1");
}

export function hasPlayed(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(PWA_PLAYED_KEY) === "1";
}

export function shouldShowInstallUi(params: {
  installed: boolean;
  dismissed: boolean;
  pageViews: number;
  sessionMs: number;
  hasPlayed: boolean;
  canPrompt: boolean;
  isIos: boolean;
}): boolean {
  if (params.installed || params.dismissed) return false;
  if (!params.canPrompt && !params.isIos) return false;

  const engaged =
    params.pageViews >= PWA_ENGAGEMENT.minPageViews ||
    params.sessionMs >= PWA_ENGAGEMENT.minSessionMs ||
    params.hasPlayed;

  return engaged;
}
