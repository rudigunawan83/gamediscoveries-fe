"use client";

import type { HistoryItem } from "@/features/my-games/types/my-games.types";
import { LibraryGameGrid } from "@/features/my-games/components/LibraryGameGrid";
import { formatPlayedAt } from "@/features/my-games/utils/formatPlayedAt";

type ContinuePlayingProps = {
  items: HistoryItem[];
};

export function ContinuePlaying({ items }: ContinuePlayingProps) {
  if (items.length === 0) {
    return null;
  }

  const games = items.map((item) => item.game);
  const metaByGameId = Object.fromEntries(
    items.map((item) => [item.gameId, formatPlayedAt(item.playedAt)]),
  );

  return (
    <section
      className="space-y-4 rounded-3xl border border-border/50 bg-gradient-to-br from-card/70 via-card/40 to-transparent p-4 md:p-6"
      aria-labelledby="continue-playing-title"
    >
      <div>
        <h2
          id="continue-playing-title"
          className="font-display text-xl font-semibold text-white"
        >
          Continue Playing
        </h2>
        <p className="text-sm text-muted-foreground">
          Jump back into games you played recently.
        </p>
      </div>
      <LibraryGameGrid
        games={games}
        source="history"
        metaByGameId={metaByGameId}
        columns="continue"
      />
    </section>
  );
}
