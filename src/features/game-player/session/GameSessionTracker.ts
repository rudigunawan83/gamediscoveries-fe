import {
  endGamePlaySession,
  heartbeatGamePlaySession,
  pauseGamePlaySession,
  resumeGamePlaySession,
  startGamePlaySession,
  type GamePlaySessionDto,
} from "@/features/game-player/api/gameSessionApi";

export type GameSessionTrackerOptions = {
  gameId: string;
  heartbeatIntervalMs?: number;
  onUpdate?: (session: GamePlaySessionDto) => void;
};

type PendingOp =
  | { type: "heartbeat" }
  | { type: "pause"; reason: string }
  | { type: "resume"; reason: string }
  | { type: "end"; reason: string };

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

/**
 * Trusted web session tracker.
 * Server remains source of truth for activeSeconds / validity.
 */
export class GameSessionTracker {
  private readonly gameId: string;
  private readonly heartbeatIntervalMs: number;
  private readonly onUpdate?: (session: GamePlaySessionDto) => void;
  private sessionId: string | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private started = false;
  private ended = false;
  private paused = false;
  private listenersBound = false;
  private queue: PendingOp[] = [];
  private flushing = false;
  private lastSession: GamePlaySessionDto | null = null;

  constructor(options: GameSessionTrackerOptions) {
    this.gameId = options.gameId;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? 30_000;
    this.onUpdate = options.onUpdate;
  }

  getSessionId() {
    return this.sessionId;
  }

  getLastSession() {
    return this.lastSession;
  }

  async start() {
    if (this.started || typeof window === "undefined") return this.lastSession;
    this.started = true;
    this.ended = false;
    this.sessionId = createUuid();

    try {
      const response = await startGamePlaySession(this.gameId, this.sessionId);
      this.lastSession = response.data ?? null;
      if (this.lastSession) this.onUpdate?.(this.lastSession);
      this.bindLifecycle();
      this.startHeartbeat();
      return this.lastSession;
    } catch {
      // Retry once later via queue end/heartbeat after recovery.
      this.queue.push({ type: "heartbeat" });
      this.bindLifecycle();
      this.startHeartbeat();
      return null;
    }
  }

  pause(reason = "TAB_HIDDEN") {
    if (!this.sessionId || this.ended || this.paused) return;
    this.paused = true;
    this.enqueue({ type: "pause", reason });
  }

  resume(reason = "APP_FOREGROUND") {
    if (!this.sessionId || this.ended || !this.paused) return;
    this.paused = false;
    this.enqueue({ type: "resume", reason });
  }

  async end(reason = "USER_EXIT") {
    if (!this.sessionId || this.ended) return this.lastSession;
    this.ended = true;
    this.stopHeartbeat();
    this.unbindLifecycle();

    try {
      const response = await endGamePlaySession(this.sessionId, reason);
      this.lastSession = response.data ?? this.lastSession;
      if (this.lastSession) this.onUpdate?.(this.lastSession);
      return this.lastSession;
    } catch {
      this.queue.push({ type: "end", reason });
      void this.flushQueue();
      return this.lastSession;
    }
  }

  destroy() {
    this.stopHeartbeat();
    this.unbindLifecycle();
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ended || this.paused || !this.sessionId) return;
      this.enqueue({ type: "heartbeat" });
    }, this.heartbeatIntervalMs);
    // Immediate first heartbeat shortly after start.
    window.setTimeout(() => {
      if (!this.ended && !this.paused) this.enqueue({ type: "heartbeat" });
    }, 1_000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private onVisibility = () => {
    if (typeof document === "undefined") return;
    if (document.visibilityState === "hidden") {
      this.pause("TAB_HIDDEN");
    } else {
      this.resume("APP_FOREGROUND");
    }
  };

  private onBlur = () => {
    this.pause("WINDOW_BLUR");
  };

  private onFocus = () => {
    this.resume("APP_FOREGROUND");
  };

  private bindLifecycle() {
    if (this.listenersBound || typeof window === "undefined") return;
    this.listenersBound = true;
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("blur", this.onBlur);
    window.addEventListener("focus", this.onFocus);
    // pagehide/end is owned by usePlaySession to avoid duplicate end calls.
  }

  private unbindLifecycle() {
    if (!this.listenersBound || typeof window === "undefined") return;
    this.listenersBound = false;
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("blur", this.onBlur);
    window.removeEventListener("focus", this.onFocus);
  }

  private enqueue(op: PendingOp) {
    this.queue.push(op);
    void this.flushQueue();
  }

  private async flushQueue() {
    if (this.flushing || !this.sessionId) return;
    this.flushing = true;
    try {
      while (this.queue.length > 0) {
        const op = this.queue.shift()!;
        try {
          if (op.type === "heartbeat") {
            const response = await heartbeatGamePlaySession(this.sessionId);
            this.lastSession = response.data ?? this.lastSession;
          } else if (op.type === "pause") {
            const response = await pauseGamePlaySession(this.sessionId, op.reason);
            this.lastSession = response.data ?? this.lastSession;
          } else if (op.type === "resume") {
            const response = await resumeGamePlaySession(this.sessionId, op.reason);
            this.lastSession = response.data ?? this.lastSession;
          } else if (op.type === "end") {
            const response = await endGamePlaySession(this.sessionId, op.reason);
            this.lastSession = response.data ?? this.lastSession;
            this.ended = true;
          }
          if (this.lastSession) this.onUpdate?.(this.lastSession);
        } catch {
          // Re-queue failed op (except floods of heartbeats).
          if (op.type !== "heartbeat") {
            this.queue.unshift(op);
          }
          break;
        }
      }
    } finally {
      this.flushing = false;
    }
  }
}
