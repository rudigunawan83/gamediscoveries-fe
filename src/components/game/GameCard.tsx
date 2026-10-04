"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics/client";
import { formatPlayCount, formatRating } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/stores/preferences.store";
import type { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
  className?: string;
}

export function GameCard({ game, className }: GameCardProps) {
  const favoriteSlugs = usePreferencesStore((state) => state.favoriteSlugs);
  const toggleFavorite = usePreferencesStore((state) => state.toggleFavorite);
  const isFavorite = favoriteSlugs.includes(game.slug);
  const categoryLabel = game.categories
    .slice(0, 2)
    .map((category) => category.name)
    .join(" · ");

  return (
    <article
      className={cn(
        "group game-card-surface relative overflow-hidden rounded-2xl border border-border/60 transition-transform duration-300 hover:-translate-y-0.5",
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
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={game.thumbnailUrl}
            alt={`${game.title} thumbnail`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
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
        </div>
        <div className="space-y-2 p-3">
          <h3 className="line-clamp-1 font-display text-sm font-semibold md:text-base">
            {game.title}
          </h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">{categoryLabel}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-warning text-warning" aria-hidden="true" />
              <span className="sr-only">Rating</span>
              {formatRating(game.rating)}
            </span>
            <span>{formatPlayCount(game.playCount)} plays</span>
          </div>
        </div>
      </Link>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        aria-label={isFavorite ? "Remove game from favorites" : "Add game to favorites"}
        aria-pressed={isFavorite}
        className="absolute right-2 top-2 size-8 rounded-full bg-background/70 backdrop-blur"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleFavorite(game.slug);
        }}
      >
        <Heart
          className={cn("size-4", isFavorite && "fill-destructive text-destructive")}
          aria-hidden="true"
        />
      </Button>
    </article>
  );
}
