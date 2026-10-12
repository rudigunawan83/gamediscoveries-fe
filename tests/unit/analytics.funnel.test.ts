import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  IMMEDIATE_FLUSH_EVENTS,
  SERVER_RECORDED_EVENTS,
  toCanonicalEventType,
} from "@/lib/analytics/catalog";
import { GAME_LOAD_TIMEOUT_MS, useGamePlayer } from "@/features/game-player/hooks/useGamePlayer";

describe("analytics funnel catalog", () => {
  it("keeps a Play click separate from a game start and from a load", () => {
    expect(toCanonicalEventType("game_play_clicked")).toBe("PLAY_CLICK");
    expect(toCanonicalEventType("game_loaded")).toBe("GAME_LOADED");
    expect(toCanonicalEventType("game_load_failed")).toBe("GAME_LOAD_FAILED");
    expect(toCanonicalEventType("game_started")).toBe("GAME_START");
  });

  it("sends clicks and failures right away and leaves favorites to the server", () => {
    expect(IMMEDIATE_FLUSH_EVENTS.has("PLAY_CLICK")).toBe(true);
    expect(IMMEDIATE_FLUSH_EVENTS.has("GAME_LOAD_FAILED")).toBe(true);
    expect(SERVER_RECORDED_EVENTS.has("FAVORITE_ADDED")).toBe(true);
  });
});

describe("useGamePlayer load outcomes", () => {
  const args = { status: "published", playUrl: "https://html5.gamemonetize.co/abc/" };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports one load with its duration, even when the frame reloads", () => {
    const onLoaded = vi.fn();
    const onLoadFailed = vi.fn();
    const { result } = renderHook(() => useGamePlayer({ ...args, onLoaded, onLoadFailed }));
    expect(result.current.state).toBe("loading");

    act(() => {
      vi.advanceTimersByTime(1_200);
      result.current.onFrameLoad();
      result.current.onFrameLoad();
    });

    expect(result.current.state).toBe("playing");
    expect(onLoaded).toHaveBeenCalledTimes(1);
    expect(onLoaded.mock.calls[0]![0]).toBeGreaterThanOrEqual(0);
    act(() => {
      vi.advanceTimersByTime(GAME_LOAD_TIMEOUT_MS);
    });
    expect(onLoadFailed).not.toHaveBeenCalled();
  });

  it("fails a frame that never loads after the timeout", () => {
    const onLoaded = vi.fn();
    const onLoadFailed = vi.fn();
    const { result } = renderHook(() => useGamePlayer({ ...args, onLoaded, onLoadFailed }));
    expect(result.current.state).toBe("loading");

    act(() => {
      vi.advanceTimersByTime(GAME_LOAD_TIMEOUT_MS);
    });

    expect(result.current.state).toBe("error");
    expect(result.current.errorKind).toBe("load_timeout");
    expect(onLoadFailed).toHaveBeenCalledWith("load_timeout");
    expect(onLoaded).not.toHaveBeenCalled();
  });
});
