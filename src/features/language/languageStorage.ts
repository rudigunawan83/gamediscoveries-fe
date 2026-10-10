import { LOCALE_COOKIE, parseLanguageMode, type LanguageMode } from "@/i18n/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const NEEDS_SYNC_KEY = "gd-locale-needs-sync";

export function readLanguageCookie(): LanguageMode {
  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`));
  return parseLanguageMode(entry?.slice(LOCALE_COOKIE.length + 1)) ?? "SYSTEM";
}

export function writeLanguageCookie(mode: LanguageMode) {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${mode}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax${secure}`;
}

/** True while a choice made in this browser has not been saved to the account. */
export function languageNeedsSync(): boolean {
  try {
    return window.localStorage.getItem(NEEDS_SYNC_KEY) === "1";
  } catch {
    return false;
  }
}

export function setLanguageNeedsSync(value: boolean) {
  try {
    if (value) {
      window.localStorage.setItem(NEEDS_SYNC_KEY, "1");
    } else {
      window.localStorage.removeItem(NEEDS_SYNC_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode); sync then only happens on change.
  }
}
