"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  GamePlayerErrorKind,
  GamePlayerState,
} from "@/features/game-player/types/game-player.types";
import { isPlayableGame, validatePlayUrl } from "@/features/game-player/utils/playerUrl";
import type { GameOrientation } from "@/types/game";

/** Embeds that never fire `load` (blocked, hanging CDN) are reported as failed after this. */
export const GAME_LOAD_TIMEOUT_MS = 45_000;

export type GameLoadFailure = "load_failed" | "load_timeout";

type UseGamePlayerArgs = {
  status?: string | null;
  playUrl?: string | null;
  orientation?: GameOrientation;
  onLoaded?: (loadMs: number) => void;
  onLoadFailed?: (reason: GameLoadFailure) => void;
};

type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

function detectFullscreenSupport(): boolean {
  if (typeof document === "undefined") return false;
  return typeof document.documentElement.requestFullscreen === "function";
}

export function useGamePlayer({
  status,
  playUrl,
  orientation,
  onLoaded,
  onLoadFailed,
}: UseGamePlayerArgs) {
  const validation = useMemo(() => validatePlayUrl(playUrl), [playUrl]);
  const playable = isPlayableGame(status, playUrl);

  const [state, setState] = useState<GamePlayerState>(() =>
    playable && validation.ok ? "loading" : "error",
  );
  const [errorKind, setErrorKind] = useState<GamePlayerErrorKind | null>(() => {
    if (!playable) return "unavailable";
    if (!validation.ok) return "invalid_url";
    return null;
  });
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported] = useState(detectFullscreenSupport);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!isLandscapeEligible(orientation) || !document.fullscreenElement) {
      return;
    }

    void lockLandscape();

    return () => {
      unlockOrientation();
    };
  }, [orientation, isFullscreen]);

  const validatedUrl = validation.ok ? validation.url : null;

  const callbacksRef = useRef({ onLoaded, onLoadFailed });
  useEffect(() => {
    callbacksRef.current = { onLoaded, onLoadFailed };
  });

  // One outcome per attempt: games navigate inside the frame and re-fire `load`.
  const attemptRef = useRef<{ startedAt: number; settled: boolean }>({
    startedAt: 0,
    settled: true,
  });

  useEffect(() => {
    if (state !== "loading") return;
    const attempt = { startedAt: performance.now(), settled: false };
    attemptRef.current = attempt;
    const timer = window.setTimeout(() => {
      if (attempt.settled) return;
      attempt.settled = true;
      setState("error");
      setErrorKind("load_timeout");
      callbacksRef.current.onLoadFailed?.("load_timeout");
    }, GAME_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [state, iframeKey]);

  const onFrameLoad = useCallback(() => {
    const attempt = attemptRef.current;
    if (!attempt.settled) {
      attempt.settled = true;
      callbacksRef.current.onLoaded?.(Math.round(performance.now() - attempt.startedAt));
    }
    setState("playing");
    setErrorKind(null);
  }, []);

  const onFrameError = useCallback(() => {
    const attempt = attemptRef.current;
    if (!attempt.settled) {
      attempt.settled = true;
      callbacksRef.current.onLoadFailed?.("load_failed");
    }
    setState("error");
    setErrorKind("load_failed");
  }, []);

  const retry = useCallback(() => {
    if (!playable || !validation.ok) {
      setState("error");
      setErrorKind(playable ? "invalid_url" : "unavailable");
      return;
    }
    setErrorKind(null);
    setState("loading");
    setIframeKey((key) => key + 1);
  }, [playable, validation.ok]);

  const toggleFullscreen = useCallback(async (target: HTMLElement | null) => {
    if (!target || !detectFullscreenSupport()) return;
    try {
      if (document.fullscreenElement) {
        unlockOrientation();
        await document.exitFullscreen();
        return;
      }
      await target.requestFullscreen();
      if (isLandscapeEligible(orientation)) {
        await lockLandscape();
      }
    } catch {
      // Keep playable when fullscreen is denied.
    }
  }, [orientation]);

  return {
    state,
    errorKind,
    validatedUrl,
    iframeKey,
    isFullscreen,
    fullscreenSupported,
    onFrameLoad,
    onFrameError,
    retry,
    toggleFullscreen,
  };
}

function isLandscapeEligible(orientation?: GameOrientation) {
  return orientation === "landscape" || orientation === "both";
}

async function lockLandscape() {
  try {
    await (screen.orientation as LockableScreenOrientation | undefined)?.lock?.("landscape");
  } catch {
    // Orientation lock is best-effort and browser/device dependent.
  }
}

function unlockOrientation() {
  try {
    screen.orientation?.unlock?.();
  } catch {
    // Ignore unsupported unlock implementations.
  }
}
