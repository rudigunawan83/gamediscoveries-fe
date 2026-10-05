import type { AnalyticsEventName, AnalyticsPayload } from "@/lib/analytics/types";
import {
  IMMEDIATE_FLUSH_EVENTS,
  toCanonicalEventType,
} from "@/lib/analytics/catalog";
import {
  createEventId,
  getAnalyticsSessionId,
  getAnonymousId,
} from "@/lib/analytics/identity";
import {
  postAnalyticsEvent,
  postAnalyticsEventBatch,
  type AnalyticsIngestEvent,
} from "@/lib/analytics/api";

const MAX_QUEUE = 100;
const FLUSH_INTERVAL_MS = 4_000;
const MAX_RETRIES = 3;

let queue: AnalyticsIngestEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;
let listenersBound = false;

function detectDeviceType(): string | undefined {
  if (typeof navigator === "undefined") return undefined;
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return "MOBILE";
  if (/Tablet|iPad/i.test(ua)) return "TABLET";
  return "DESKTOP";
}

function buildEvent(
  eventName: AnalyticsEventName | string,
  payload?: AnalyticsPayload,
): AnalyticsIngestEvent {
  const eventType = toCanonicalEventType(eventName);
  const metadata: Record<string, string | number | boolean | null | undefined> =
    { ...(payload ?? {}) };

  const gameIdRaw = metadata.gameId;
  delete metadata.gameId;

  let gameId: string | undefined;
  if (typeof gameIdRaw === "string" && gameIdRaw.length > 0) {
    gameId = gameIdRaw;
  }

  // GAME_SESSION_END requires sessionId + gameId; keep duration in metadata only.
  return {
    eventId: createEventId(),
    eventType,
    anonymousId: getAnonymousId(),
    sessionId: getAnalyticsSessionId(),
    gameId,
    source: "WEB",
    platform: "WEB",
    deviceType: detectDeviceType(),
    pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
    referrerUrl:
      typeof document !== "undefined" ? document.referrer || undefined : undefined,
    metadata,
    occurredAt: new Date().toISOString(),
  };
}

function scheduleFlush(immediate = false) {
  if (typeof window === "undefined") return;

  if (immediate) {
    void flush();
    return;
  }

  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, FLUSH_INTERVAL_MS);
}

function bindLifecycleListeners() {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;

  const onHide = () => {
    void flush();
  };

  window.addEventListener("pagehide", onHide);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      onHide();
    }
  });
}

async function sendWithRetry(events: AnalyticsIngestEvent[]) {
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      if (events.length === 1 && IMMEDIATE_FLUSH_EVENTS.has(events[0].eventType)) {
        await postAnalyticsEvent(events[0]);
      } else {
        await postAnalyticsEventBatch(events);
      }
      return;
    } catch {
      attempt += 1;
      if (attempt >= MAX_RETRIES) {
        // Re-queue failed events (cap to avoid unbounded growth).
        queue = [...events, ...queue].slice(0, MAX_QUEUE);
        return;
      }
      await new Promise((r) => setTimeout(r, 250 * attempt));
    }
  }
}

export async function flush() {
  if (flushing || queue.length === 0 || typeof window === "undefined") {
    return;
  }

  flushing = true;
  const batch = queue.splice(0, MAX_QUEUE);
  try {
    await sendWithRetry(batch);
  } finally {
    flushing = false;
    if (queue.length > 0) {
      scheduleFlush();
    }
  }
}

function emit(event: AnalyticsEventName | string, payload?: AnalyticsPayload) {
  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event, payload ?? {});
  }

  if (typeof window === "undefined") {
    return;
  }

  bindLifecycleListeners();

  const item = buildEvent(event, payload);
  queue.push(item);
  if (queue.length > MAX_QUEUE) {
    queue = queue.slice(queue.length - MAX_QUEUE);
  }

  const immediate = IMMEDIATE_FLUSH_EVENTS.has(item.eventType);
  scheduleFlush(immediate);
}

export const analytics = {
  track(event: AnalyticsEventName, payload?: AnalyticsPayload) {
    emit(event, payload);
  },
  pageView(path: string) {
    emit("page_view", { path });
  },
  flush,
  getAnonymousId,
  getSessionId: getAnalyticsSessionId,
};
