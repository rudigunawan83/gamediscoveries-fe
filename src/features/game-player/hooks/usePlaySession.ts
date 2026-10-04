"use client";

import { useCallback, useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics/client";
import { calculatePlayDurationSeconds } from "@/features/game-player/utils/playDuration";
import type { PlaySessionPhase } from "@/features/game-player/types/game-player.types";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { recordHistory } from "@/features/my-games/api/historyApi";
import { myGamesKeys } from "@/features/my-games/api/myGamesKeys";
import { useQueryClient } from "@tanstack/react-query";

type UsePlaySessionArgs = {
  gameId: string;
  gameSlug: string;
  source?: string;
};

async function persistHistory(
  gameId: string,
  durationSeconds: number,
  userId: string | undefined,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  try {
    await recordHistory({ gameId, durationSeconds });
    void queryClient.invalidateQueries({
      queryKey: myGamesKeys.historyRoot(userId),
    });
    void queryClient.invalidateQueries({
      queryKey: myGamesKeys.all,
    });
  } catch {
    // Anonymous analytics still work; history is best-effort for UX.
  }
}

export function usePlaySession({
  gameId,
  gameSlug,
  source = "game_detail",
}: UsePlaySessionArgs) {
  const phaseRef = useRef<PlaySessionPhase>("game_view");
  const startedAtRef = useRef<number | null>(null);
  const exitedRef = useRef(false);
  const recordedStartRef = useRef(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  const markViewed = useCallback(() => {
    phaseRef.current = "game_view";
    analytics.track("game_viewed", { gameId, gameSlug, source });
  }, [gameId, gameSlug, source]);

  const markPlayClicked = useCallback(() => {
    phaseRef.current = "game_play_clicked";
    analytics.track("game_play_clicked", { gameId, gameSlug, source });
  }, [gameId, gameSlug, source]);

  const markStarted = useCallback(() => {
    if (phaseRef.current === "game_started" || phaseRef.current === "play_session_active") {
      return;
    }
    phaseRef.current = "game_started";
    startedAtRef.current = Date.now();
    analytics.track("game_started", { gameId, gameSlug });
    phaseRef.current = "play_session_active";

    if (accessToken && !recordedStartRef.current) {
      recordedStartRef.current = true;
      void persistHistory(gameId, 0, userId, queryClient);
    }
  }, [accessToken, gameId, gameSlug, queryClient, userId]);

  const markExit = useCallback(() => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    const durationSeconds = calculatePlayDurationSeconds(startedAtRef.current);
    phaseRef.current = "game_exit";
    analytics.track("game_exit", { gameId, durationSeconds });

    if (accessToken && startedAtRef.current) {
      void persistHistory(gameId, durationSeconds, userId, queryClient);
    }
  }, [accessToken, gameId, queryClient, userId]);

  useEffect(() => {
    const onPageHide = () => {
      markExit();
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      markExit();
    };
  }, [markExit]);

  return {
    markViewed,
    markPlayClicked,
    markStarted,
    markExit,
  };
}
