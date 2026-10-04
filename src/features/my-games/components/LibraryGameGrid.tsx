"use client";

import Link from "next/link";
import { GameCard } from "@/components/game/GameCard";
import { analytics } from "@/lib/analytics/client";
import type { Game } from "@/types/game";
import { cn } from "@/lib/utils";

type LibraryGameGridProps = {
  games: Game[];
  source: "my_games" | "favorites" | "history";
  metaByGameId?: Record<string, string | undefined>;
  className?: string;
  columns?: "continue" | "default";
};

export function LibraryGameGrid({
  games,
  source,
  metaByGameId,
  className,
  columns = "default",
}: LibraryGameGridProps) {
  return (
    <ul
      className={cn(
        "grid gap-4",
        columns === "continue"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-2 md:grid-cols-3 xl:grid-cols-5",
        className,
      )}
    >
      {games.map((game) => (
        <li key={game.id} className="space-y-1">
          <div
            onClickCapture={() => {
              const eventName =
                source === "history"
                  ? "history_game_clicked"
                  : "my_games_game_clicked";
              analytics.track(eventName, {
                gameId: game.id,
                source,
              });
            }}
          >
            <GameCard game={game} />
          </div>
          {metaByGameId?.[game.id] ? (
            <p className="px-1 text-xs text-muted-foreground">
              {metaByGameId[game.id]}
            </p>
          ) : null}
          {columns === "continue" ? (
            <Link
              href={`/game/${game.slug}/play`}
              className="inline-flex px-1 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Play Again
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
