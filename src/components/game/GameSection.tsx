import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GameGrid } from "@/components/game/GameGrid";
import type { Game } from "@/types/game";

interface GameSectionProps {
  title: string;
  description?: string;
  games: Game[];
  href?: string;
}

export function GameSection({ title, description, games, href }: GameSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby={`${title}-heading`}>
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 id={`${title}-heading`} className="font-display text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View All
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <GameGrid games={games} />
    </section>
  );
}
