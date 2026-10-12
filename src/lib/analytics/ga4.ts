import type { AnalyticsPayload } from "@/lib/analytics/types";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const rawMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

/** GA4 stays fully off (no script, no banner) unless a valid measurement ID is configured. */
export const GA_MEASUREMENT_ID =
  rawMeasurementId && /^G-[A-Z0-9]+$/.test(rawMeasurementId) ? rawMeasurementId : undefined;

export type AnalyticsConsent = "granted" | "denied";

export const CONSENT_STORAGE_KEY = "gd_analytics_consent";
export const CONSENT_CHANGE_EVENT = "gd:analytics-consent";

function browserOptedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1";
}

/** null means the visitor has not chosen yet. */
let pageConsent: AnalyticsConsent | null = null;

export function readConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  if (browserOptedOut()) return "denied";
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : pageConsent;
  } catch {
    return pageConsent;
  }
}

export function writeConsent(value: AnalyticsConsent) {
  pageConsent = value;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Storage blocked: the choice still applies to this page view.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }));
}

/** First-party event name -> GA4 event name. Anything not listed never reaches Google. */
const GA_EVENT_NAMES: Record<string, string> = {
  game_viewed: "game_view",
  game_play_clicked: "play_click",
  game_loaded: "game_loaded",
  game_load_failed: "game_load_failed",
  game_completed: "game_completed",
  favorite_added: "favorite_added",
  search: "search",
  share_completed: "share",
  auth_login_succeeded: "login",
  auth_register_succeeded: "sign_up",
};

/** Only non-identifying fields are forwarded; free-form payload keys are dropped. */
const GA_PARAM_NAMES: Record<string, string> = {
  gameId: "game_id",
  gameSlug: "game_slug",
  slug: "game_slug",
  source: "source",
  reason: "reason",
  method: "method",
  query: "search_term",
};

export function toGaEvent(
  event: string,
  payload?: AnalyticsPayload,
): { name: string; params: Record<string, string | number | boolean> } | null {
  const name = GA_EVENT_NAMES[event];
  if (!name) return null;

  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(payload ?? {})) {
    const param = GA_PARAM_NAMES[key];
    if (param && value !== null && value !== undefined && value !== "") {
      params[param] = value;
    }
  }
  return { name, params };
}

export function sendGaEvent(event: string, payload?: AnalyticsPayload) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  const mapped = toGaEvent(event, payload);
  if (mapped) window.gtag("event", mapped.name, mapped.params);
}
