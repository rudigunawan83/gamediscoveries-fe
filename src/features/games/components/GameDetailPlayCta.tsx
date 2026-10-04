"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics/client";

type GameDetailPlayCtaProps = {
  gameId: string;
  gameSlug: string;
  playable: boolean;
};

export function GameDetailPlayCta({
  gameId,
  gameSlug,
  playable,
}: GameDetailPlayCtaProps) {
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
      <Link
        href={`/game/${gameSlug}/play`}
        onClick={() => {
          analytics.track("game_play_clicked", {
            gameId,
            gameSlug,
            source: "game_detail",
          });
        }}
      >
        <Play className="size-4 fill-current" aria-hidden="true" />
        PLAY NOW
      </Link>
    </Button>
  );
}
