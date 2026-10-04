import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Expand, Heart, MonitorPlay, Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GameSection } from "@/components/game/GameSection";
import {
  fetchGameBySlug,
  fetchGames,
} from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";
import { formatRating } from "@/lib/utils/format";

interface GameDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: GameDetailPageProps) {
  const { slug } = await params;
  const game = await fetchGameBySlug(slug);

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
  const game = await fetchGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const categorySlug = game.categories[0]?.slug;
  const similarGames = (
    await fetchGames({
      page: 1,
      pageSize: 12,
      category: categorySlug,
      sort: "popular",
    })
  )
    .filter((item) => item.id !== game.id)
    .slice(0, 6);

  const aspect =
    game.width && game.height && game.height > 0
      ? `${game.width} / ${game.height}`
      : game.orientation === "portrait"
        ? "9 / 16"
        : "16 / 9";

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/50">
        {game.gameUrl ? (
          <div className="relative w-full bg-black" style={{ aspectRatio: aspect }}>
            <iframe
              src={game.gameUrl}
              title={`Play ${game.title}`}
              className="absolute inset-0 size-full border-0"
              allow="fullscreen; autoplay; encrypted-media; gamepad"
              allowFullScreen
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
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
        )}

        <div className="space-y-5 px-5 py-6 md:px-8">
          <div className="flex flex-wrap gap-2">
            {game.categories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
            {game.provider ? <Badge>{game.provider}</Badge> : null}
            {game.platform ? (
              <Badge variant="outline" className="capitalize">
                {game.platform}
              </Badge>
            ) : null}
            {game.orientation ? (
              <Badge variant="outline" className="capitalize">
                {game.orientation}
              </Badge>
            ) : null}
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
              {game.mobileReady ? <span>Mobile ready</span> : null}
              {game.multiplayer ? <span>Multiplayer</span> : null}
              {game.developer ? <span>by {game.developer}</span> : null}
              {game.width && game.height ? (
                <span className="inline-flex items-center gap-1">
                  <MonitorPlay className="size-3.5" aria-hidden="true" />
                  {game.width}×{game.height}
                </span>
              ) : null}
            </div>
          </div>

          {game.description ? (
            <p className="max-w-3xl whitespace-pre-line text-muted-foreground">
              {game.description}
            </p>
          ) : null}

          {game.instructions ? (
            <div className="max-w-3xl rounded-2xl border border-border/50 bg-secondary/30 p-4">
              <h2 className="mb-1 text-sm font-semibold text-white">How to play</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {game.instructions}
              </p>
            </div>
          ) : null}

          {game.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {game.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {game.gameUrl ? (
              <Button asChild size="lg" className="gap-2">
                <a href={game.gameUrl} target="_blank" rel="noopener noreferrer">
                  <Expand className="size-4" aria-hidden="true" />
                  Open Fullscreen
                </a>
              </Button>
            ) : (
              <Button size="lg" className="gap-2" disabled>
                <Play className="size-4" aria-hidden="true" />
                Play (unavailable)
              </Button>
            )}
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
          variant="discovery"
        />
      ) : null}
    </div>
  );
}
