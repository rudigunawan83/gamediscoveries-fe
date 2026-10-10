"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type MouseEvent } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics/client";
import type { GameOrientation } from "@/types/game";

type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

type GameDetailPlayCtaProps = {
  gameId: string;
  gameSlug: string;
  playable: boolean;
  orientation?: GameOrientation;
};

/** Click handler for links to the player: tracks the click and enters landscape on phones. */
export function usePlayGameClick({
  gameId,
  gameSlug,
  orientation,
}: Pick<GameDetailPlayCtaProps, "gameId" | "gameSlug" | "orientation">) {
  const router = useRouter();

  return (event: MouseEvent<HTMLAnchorElement>) => {
    analytics.track("game_play_clicked", {
      gameId,
      gameSlug,
      source: "game_detail",
      orientation,
    });

    if (!shouldRequestLandscape(orientation)) {
      return;
    }

    event.preventDefault();
    void enterLandscapeMode().finally(() => {
      router.push(`/game/${gameSlug}/play`);
    });
  };
}

export function GameDetailPlayCta({
  gameId,
  gameSlug,
  playable,
  orientation,
}: GameDetailPlayCtaProps) {
  const onPlayClick = usePlayGameClick({ gameId, gameSlug, orientation });
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    analytics.track("game_viewed", {
      gameId,
      gameSlug,
      source: "game_detail",
    });
  }, [gameId, gameSlug]);

  if (!playable) {
    return (
      <Button size="lg" className="gap-2" disabled>
        <Play className="size-4" aria-hidden="true" />
        Unavailable
      </Button>
    );
  }

  return (
    <Button asChild size="lg" className="gap-2 bg-brand-gradient text-[#1a1205]">
      <Link href={`/game/${gameSlug}/play`} onClick={onPlayClick}>
        <Play className="size-4 fill-current" aria-hidden="true" />
        PLAY NOW
      </Link>
    </Button>
  );
}

function shouldRequestLandscape(orientation?: GameOrientation) {
  if (orientation !== "landscape" && orientation !== "both") {
    return false;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
}

async function enterLandscapeMode() {
  if (typeof document === "undefined") {
    return;
  }

  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // Some mobile browsers do not allow fullscreen here; continue to gameplay.
  }

  try {
    await (screen.orientation as LockableScreenOrientation | undefined)?.lock?.("landscape");
  } catch {
    // Orientation lock is best-effort and may be blocked by the browser.
  }
}
