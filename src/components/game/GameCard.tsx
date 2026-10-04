"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/features/my-games/components/FavoriteButton";
import { analytics } from "@/lib/analytics/client";
import { displayRating } from "@/lib/utils/display-rating";
import { formatPlayCount, formatRating } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
  className?: string;
  variant?: "default" | "discovery";
  contextMeta?: string;
}

export function GameCard({
  game,
  className,
  variant = "default",
  contextMeta,
}: GameCardProps) {
  const categoryLabel =
    game.categories
      .slice(0, 2)
      .map((category) => category.name)
      .join(" · ") || "Game";
  const rating = displayRating(game.id, game.rating);
  const isDiscovery = variant === "discovery";

  return (
    <article
      className={cn(
        "group relative overflow-hidden transition-transform duration-300 hover:-translate-y-1",
        isDiscovery
          ? "rounded-2xl"
          : "game-card-surface rounded-2xl border border-border/60",
        className,
      )}
    >
      <Link
        href={`/game/${game.slug}`}
        className="block focus-visible:outline-none"
        onClick={() =>
          analytics.track("game_click", {
            gameId: game.id,
            slug: game.slug,
          })
        }
      >
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            isDiscovery ? "aspect-[4/3] rounded-2xl" : "aspect-video",
          )}
        >
          <Image
            src={game.thumbnailUrl}
            alt={`${game.title} thumbnail`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!isDiscovery ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  <Play className="size-4 fill-current" aria-hidden="true" />
                  Play
                </span>
              </div>
              {game.provider ? (
                <Badge className="absolute left-2 top-2 bg-secondary/90 text-secondary-foreground">
                  {game.provider}
                </Badge>
              ) : null}
            </>
          ) : (
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 transition group-hover:ring-primary/40" />
          )}
        </div>

        <div className={cn("space-y-1", isDiscovery ? "px-0.5 pt-3" : "space-y-2 p-3")}>
          <h3 className="line-clamp-1 font-display text-sm font-semibold text-white md:text-base">
            {game.title}
          </h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">{categoryLabel}</p>
          {contextMeta ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">{contextMeta}</p>
          ) : null}
          <div
            className={cn(
              "flex items-center text-xs text-muted-foreground",
              isDiscovery ? "justify-start gap-1 pt-0.5" : "justify-between",
            )}
          >
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-warning text-warning" aria-hidden="true" />
              <span className="sr-only">Rating</span>
              {formatRating(rating)}
            </span>
            {!isDiscovery ? (
              <span>{formatPlayCount(game.playCount)} plays</span>
            ) : null}
          </div>
        </div>
      </Link>

      {!isDiscovery ? (
        <div className="absolute right-2 top-2">
          <FavoriteButton
            gameId={game.id}
            source="game_card"
            callbackUrl={`/game/${game.slug}`}
          />
        </div>
      ) : null}
    </article>
  );
}
