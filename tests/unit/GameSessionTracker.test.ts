import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  startGamePlaySession: vi.fn(),
  heartbeatGamePlaySession: vi.fn(),
  pauseGamePlaySession: vi.fn(),
  resumeGamePlaySession: vi.fn(),
  endGamePlaySession: vi.fn(),
}));
vi.mock("@/features/game-player/api/gameSessionApi", () => api);

const { GameSessionTracker } = await import("@/features/game-player/session/GameSessionTracker");

describe("GameSessionTracker window blur", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    for (const fn of Object.values(api)) {
      fn.mockReset();
      fn.mockResolvedValue({ data: null });
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  async function startTracker() {
    const tracker = new GameSessionTracker({ gameId: "g1", heartbeatIntervalMs: 60_000 });
    await tracker.start();
    return tracker;
  }

  it("keeps playing when focus moves into the game iframe", async () => {
    const tracker = await startTracker();
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.focus();
    expect(document.activeElement).toBe(iframe);

    window.dispatchEvent(new Event("blur"));
    await vi.advanceTimersByTimeAsync(10);

    expect(api.pauseGamePlaySession).not.toHaveBeenCalled();
    tracker.destroy();
  });

  it("pauses when the window loses focus to something outside the page", async () => {
    const tracker = await startTracker();

    window.dispatchEvent(new Event("blur"));
    await vi.advanceTimersByTimeAsync(10);

    expect(api.pauseGamePlaySession).toHaveBeenCalledWith(expect.any(String), "WINDOW_BLUR");
    tracker.destroy();
  });
});
