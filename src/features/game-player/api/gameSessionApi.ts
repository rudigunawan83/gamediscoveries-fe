import { apiClient } from "@/lib/api/client";
import { getAnonymousId } from "@/lib/analytics/identity";

export type GamePlaySessionDto = {
  sessionId: string;
  gameId: string;
  status: string;
  startedAt: string;
  lastHeartbeatAt?: string | null;
  pausedAt?: string | null;
  resumedAt?: string | null;
  endedAt?: string | null;
  durationSeconds: number;
  activeSeconds: number;
  isValid: boolean;
  invalidReason?: string | null;
  source: string;
  platform: string;
};

function detectDeviceType(): string {
  if (typeof navigator === "undefined") return "DESKTOP";
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return "MOBILE";
  if (/Tablet|iPad/i.test(ua)) return "TABLET";
  return "DESKTOP";
}

export async function startGamePlaySession(gameId: string, sessionId: string) {
  return apiClient.post<GamePlaySessionDto>(
    `/api/v1/games/${gameId}/sessions/start`,
    {
      sessionId,
      anonymousId: getAnonymousId(),
      source: "WEB",
      platform: "WEB",
      deviceType: detectDeviceType(),
    },
    { timeoutMs: 8_000 },
  );
}

export async function heartbeatGamePlaySession(sessionId: string) {
  return apiClient.post<GamePlaySessionDto>(
    `/api/v1/games/sessions/${sessionId}/heartbeat`,
    {
      anonymousId: getAnonymousId(),
      clientTimestamp: new Date().toISOString(),
      visibilityState:
        typeof document !== "undefined" ? document.visibilityState : "visible",
      isFocused: typeof document !== "undefined" ? document.hasFocus() : true,
    },
    { timeoutMs: 5_000 },
  );
}

export async function pauseGamePlaySession(
  sessionId: string,
  reason: string,
) {
  return apiClient.post<GamePlaySessionDto>(
    `/api/v1/games/sessions/${sessionId}/pause`,
    { anonymousId: getAnonymousId(), reason },
    { timeoutMs: 5_000 },
  );
}

export async function resumeGamePlaySession(
  sessionId: string,
  reason = "APP_FOREGROUND",
) {
  return apiClient.post<GamePlaySessionDto>(
    `/api/v1/games/sessions/${sessionId}/resume`,
    { anonymousId: getAnonymousId(), reason },
    { timeoutMs: 5_000 },
  );
}

export async function endGamePlaySession(
  sessionId: string,
  reason = "USER_EXIT",
) {
  return apiClient.post<GamePlaySessionDto>(
    `/api/v1/games/sessions/${sessionId}/end`,
    { anonymousId: getAnonymousId(), reason },
    { timeoutMs: 8_000 },
  );
}
