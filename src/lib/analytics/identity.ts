const ANON_KEY = "gd_anonymous_id";
const SESSION_KEY = "gd_analytics_session_id";

function createUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function readStorage(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Ignore private mode / storage quota errors.
  }
}

export function getAnonymousId(): string {
  if (typeof window === "undefined") {
    return createUuid();
  }

  const existing = readStorage(window.localStorage, ANON_KEY);
  if (existing) {
    return existing;
  }

  const created = createUuid();
  writeStorage(window.localStorage, ANON_KEY, created);
  return created;
}

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") {
    return createUuid();
  }

  const existing = readStorage(window.sessionStorage, SESSION_KEY);
  if (existing) {
    return existing;
  }

  const created = createUuid();
  writeStorage(window.sessionStorage, SESSION_KEY, created);
  return created;
}

export function createEventId(): string {
  return createUuid();
}
