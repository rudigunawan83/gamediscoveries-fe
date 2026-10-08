"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  GamePlayerErrorKind,
  GamePlayerState,
} from "@/features/game-player/types/game-player.types";
import { isPlayableGame, validatePlayUrl } from "@/features/game-player/utils/playerUrl";
import type { GameOrientation } from "@/types/game";

type UseGamePlayerArgs = {
  status?: string | null;
  playUrl?: string | null;
  orientation?: GameOrientation;
};

type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

function detectFullscreenSupport(): boolean {
  if (typeof document === "undefined") return false;
  return typeof document.documentElement.requestFullscreen === "function";
}

export function useGamePlayer({ status, playUrl, orientation }: UseGamePlayerArgs) {
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

  const onFrameLoad = useCallback(() => {
    setState("playing");
    setErrorKind(null);
  }, []);

  const onFrameError = useCallback(() => {
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
