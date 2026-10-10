import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { GameGrid } from "@/components/game/GameGrid";
import type { Game } from "@/types/game";

interface GameSectionProps {
  title: string;
  description?: string;
  games: Game[];
  href?: string;
  variant?: "default" | "discovery";
}

export function GameSection({
  title,
  description,
  games,
  href,
  variant = "default",
}: GameSectionProps) {
  const t = useTranslations("Common");
  if (games.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5" aria-labelledby={`${title}-heading`}>
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h2
            id={`${title}-heading`}
            className="font-display text-2xl font-bold tracking-tight text-white md:text-[1.75rem]"
          >
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 text-sm font-semibold text-primary hover:text-[#ffe08a]"
          >
            {t("seeAll")}
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <GameGrid games={games} variant={variant} />
    </section>
  );
}
