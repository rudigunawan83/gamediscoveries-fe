/**
 * Defense-in-depth play URL validation.
 *
 * Contract: the GameDiscoveries API must return an allowlisted / validated
 * play URL (Game.playUrl). The frontend must never render iframe URLs from
 * user input or query strings. This helper only re-checks HTTPS + host
 * suffixes configured for trusted embed hosts.
 */

/** Trusted embed host suffixes. Extend when new providers are onboarded via API. */
export const TRUSTED_PLAY_HOST_SUFFIXES = [
  "gamemonetize.com",
  "gamemonetize.co",
] as const;

export type PlayUrlValidationResult =
  | { ok: true; url: string }
  | { ok: false; reason: "missing" | "invalid" | "untrusted_host" | "insecure" };

function hostMatchesTrusted(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return TRUSTED_PLAY_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
}

/**
 * Validate a backend-provided play URL before embedding.
 * Never pass searchParams / user-controlled URLs here.
 */
export function validatePlayUrl(raw?: string | null): PlayUrlValidationResult {
  if (!raw || !raw.trim()) {
    return { ok: false, reason: "missing" };
  }

  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "insecure" };
  }

  if (!hostMatchesTrusted(parsed.hostname)) {
    return { ok: false, reason: "untrusted_host" };
  }

  return { ok: true, url: parsed.toString() };
}

export function isPlayableGame(status?: string | null, playUrl?: string | null): boolean {
  const normalized = (status ?? "published").toLowerCase();
  if (normalized !== "published" && normalized !== "active") {
    return false;
  }
  return validatePlayUrl(playUrl).ok;
}
