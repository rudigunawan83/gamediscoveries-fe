"use client";

import { useEffect, useRef } from "react";
import { GamePlayerError } from "@/features/game-player/components/GamePlayerError";
import { GamePlayerLoading } from "@/features/game-player/components/GamePlayerLoading";
import { GamePlayerToolbar } from "@/features/game-player/components/GamePlayerToolbar";
import { useGamePlayer } from "@/features/game-player/hooks/useGamePlayer";
import { usePlaySession } from "@/features/game-player/hooks/usePlaySession";
import type { GameOrientation } from "@/types/game";
import { cn } from "@/lib/utils";

export type GamePlayerProps = {
  gameId: string;
  gameSlug: string;
  title: string;
  playUrl?: string | null;
  status?: string | null;
  orientation?: GameOrientation;
  width?: number;
  height?: number;
  backHref: string;
};

/**
 * Minimum sandbox for trusted HTML5 embeds.
 * Permissions are limited to what browser games typically require.
 */
const IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-orientation-lock";

const IFRAME_ALLOW =
  "fullscreen; autoplay; encrypted-media; gamepad; accelerometer; gyroscope; pointer-lock";

export function GamePlayer({
  gameId,
  gameSlug,
  title,
  playUrl,
  status,
  orientation,
  width,
  height,
  backHref,
}: GamePlayerProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const session = usePlaySession({
    gameId,
    gameSlug,
    source: "game_player",
  });

  const {
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
  } = useGamePlayer({ status, playUrl, orientation });

  useEffect(() => {
    if (state === "playing") {
      session.markStarted();
    }
  }, [session, state]);

  const aspect =
    width && height && height > 0
      ? `${width} / ${height}`
      : orientation === "portrait"
        ? "9 / 16"
        : "16 / 9";
  const shouldForceLandscape = orientation === "landscape" || orientation === "both";

  return (
    <div
      ref={shellRef}
      data-force-landscape={shouldForceLandscape ? "true" : undefined}
      className={cn(
        "flex h-[100dvh] w-full flex-col overscroll-none bg-[#060914] text-white",
        isFullscreen && "fixed inset-0 z-[100]",
      )}
      style={{ touchAction: state === "playing" ? "none" : "manipulation" }}
    >
      <GamePlayerToolbar
        title={title}
        backHref={backHref}
        fullscreenSupported={fullscreenSupported}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => {
          void toggleFullscreen(shellRef.current);
        }}
      />

      <div className="game-player-stage relative flex min-h-0 flex-1 items-center justify-center overflow-hidden overscroll-none bg-black pb-[env(safe-area-inset-bottom)]">
        {state === "error" && errorKind ? (
          <GamePlayerError kind={errorKind} backHref={backHref} onRetry={retry} />
        ) : (
          <div
            className={cn(
              "game-player-frame relative w-full max-w-7xl bg-black",
              isFullscreen ? "h-full max-w-none" : "max-h-full",
            )}
            style={isFullscreen ? { height: "100%" } : { aspectRatio: aspect, width: "100%" }}
          >
            {state === "loading" ? (
              <div className="absolute inset-0 z-10">
                <GamePlayerLoading />
              </div>
            ) : null}

            {validatedUrl ? (
              <iframe
                key={iframeKey}
                src={validatedUrl}
                title={`Playing ${title}`}
                className="absolute inset-0 size-full border-0"
                sandbox={IFRAME_SANDBOX}
                allow={IFRAME_ALLOW}
                allowFullScreen
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={onFrameLoad}
                onError={onFrameError}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
