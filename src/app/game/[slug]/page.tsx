import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart, Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GameSection } from "@/components/game/GameSection";
import {
  getMockGameBySlug,
  mockGames,
} from "@/features/games/mock/games.mock";
import { createMetadata } from "@/lib/seo/metadata";
import { formatPlayCount, formatRating } from "@/lib/utils/format";

interface GameDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GameDetailPageProps) {
  const { slug } = await params;
  const game = getMockGameBySlug(slug);

  if (!game) {
    return createMetadata({
      title: "Game Not Found",
      path: `/game/${slug}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: game.title,
    description: game.description,
    path: `/game/${slug}`,
  });
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { slug } = await params;
  const game = getMockGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const similarGames = mockGames
    .filter(
      (item) =>
        item.id !== game.id &&
        item.categories.some((category) =>
          game.categories.some((owned) => owned.id === category.id),
        ),
    )
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/50">
        <div className="relative aspect-[21/9] min-h-56 bg-muted">
          <Image
            src={game.coverUrl ?? game.thumbnailUrl}
            alt={`${game.title} cover`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="space-y-5 px-5 py-6 md:px-8">
          <div className="flex flex-wrap gap-2">
            {game.categories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
            {game.provider ? <Badge>{game.provider}</Badge> : null}
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {game.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="size-4 fill-warning text-warning" aria-hidden="true" />
                {formatRating(game.rating)}
              </span>
              <span>{formatPlayCount(game.playCount)} plays</span>
              {game.mobileReady ? <span>Mobile ready</span> : null}
              {game.multiplayer ? <span>Multiplayer</span> : null}
            </div>
          </div>

          <p className="max-w-3xl text-muted-foreground">{game.description}</p>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="gap-2" disabled>
              <Play className="size-4" aria-hidden="true" />
              Play (coming soon)
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/games">
                <Heart className="size-4" aria-hidden="true" />
                Browse more
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {similarGames.length > 0 ? (
        <GameSection
          title="Similar Games"
          description="More titles in related categories."
          games={similarGames}
          href="/games"
        />
      ) : (
        <p className="text-sm text-muted-foreground">Similar games placeholder.</p>
      )}
    </div>
  );
}
