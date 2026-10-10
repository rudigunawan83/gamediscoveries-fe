"use client";

import { useTranslations } from "next-intl";
import type { HistoryItem } from "@/features/my-games/types/my-games.types";
import { LibraryGameGrid } from "@/features/my-games/components/LibraryGameGrid";
import {
  formatHistoryMeta,
  useHistoryFormatter,
} from "@/features/my-games/utils/formatPlayTime";

type ContinuePlayingProps = {
  items: HistoryItem[];
};

export function ContinuePlaying({ items }: ContinuePlayingProps) {
  const t = useTranslations("Library");
  const fmt = useHistoryFormatter();
  if (items.length === 0) {
    return null;
  }

  const games = items.map((item) => item.game);
  const metaByGameId = Object.fromEntries(
    items.map((item) => [item.gameId, formatHistoryMeta(fmt, item)]),
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
          {t("continuePlaying")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("continuePlayingDescription")}
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
