"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { useHistoryPreview } from "@/features/my-games/hooks/useHistory";
import {
  formatHistoryMeta,
  useHistoryFormatter,
} from "@/features/my-games/utils/formatPlayTime";

/**
 * Last game played on any device (web or app) with a one-click Continue that
 * opens the player directly. Hidden for guests and empty history.
 */
export function HomeContinuePlaying() {
  const t = useTranslations("Library");
  const tGame = useTranslations("Game");
  const fmt = useHistoryFormatter();
  const query = useHistoryPreview(6);
  const item = query.data?.pages[0]?.items[0];
  if (!item) return null;

  const { game } = item;

  return (
    <section aria-labelledby="home-continue-title" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2
          id="home-continue-title"
          className="font-display text-xl font-semibold text-white"
        >
          {t("continuePlaying")}
        </h2>
        <Link
          href="/my-games?tab=history"
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("viewAllHistory")}
        </Link>
      </div>
      <div className="flex items-center gap-4 rounded-3xl border border-primary/40 bg-gradient-to-br from-card/80 via-card/50 to-transparent p-3 md:p-4">
        <Link
          href={`/game/${game.slug}`}
          className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted md:size-24"
        >
          <Image
            src={game.thumbnailUrl}
            alt={tGame("thumbnailAlt", { title: game.title })}
            fill
            sizes="96px"
            className="object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/game/${game.slug}`}
            className="block truncate font-display text-lg font-semibold text-white hover:underline"
          >
            {game.title}
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {formatHistoryMeta(fmt, item)}
          </p>
        </div>
        <Link
          href={`/game/${game.slug}/play`}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Play className="size-4 fill-current" aria-hidden="true" />
          {t("continue")}
        </Link>
      </div>
    </section>
  );
}
