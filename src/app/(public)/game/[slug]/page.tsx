import Image from "next/image";
import { notFound } from "next/navigation";
import { MonitorPlay, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GameBreadcrumbs } from "@/components/game/GameBreadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { GameDetailFavoriteButton } from "@/features/my-games/components/GameDetailFavoriteButton";
import { GameDetailPlayCta } from "@/features/games/components/GameDetailPlayCta";
import {
  fetchGameBySlug,
  fetchGames,
} from "@/features/games/api/games.api";
import { SimilarGamesSection } from "@/features/recommendations/components/RecommendationSection";
import { isPlayableGame } from "@/features/game-player/utils/playerUrl";
import { env } from "@/config/env";
import { SITE_NAME } from "@/lib/seo/constants";
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

  const description =
    game.description?.trim() ||
    `Play ${game.title} online for free on GameDiscoveries.`;

  return createMetadata({
    title: game.title,
    description,
    path: `/game/${slug}`,
    image: game.coverUrl ?? game.thumbnailUrl,
  });
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { slug } = await params;
  const game = await fetchGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const playable = isPlayableGame(game.status, game.playUrl ?? game.gameUrl);
  const categorySlug = game.categories[0]?.slug;
  const categoryName = game.categories[0]?.name;

  const similarGames = (
    await fetchGames({
      page: 1,
      pageSize: 12,
      category: categoryName ?? categorySlug,
      sort: "popular",
    })
  )
    .filter((item) => item.id !== game.id)
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "VideoGame",
          name: game.title,
          description: game.description,
          image: game.coverUrl ?? game.thumbnailUrl,
          url: `${env.NEXT_PUBLIC_APP_URL}/game/${game.slug}`,
          genre: game.categories.map((c) => c.name),
          gamePlatform: ["HTML5", "Web Browser"],
          applicationCategory: "Game",
          operatingSystem: "Any",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: playable
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: env.NEXT_PUBLIC_APP_URL,
          },
        }}
      />

      <GameBreadcrumbs gameTitle={game.title} categories={game.categories} />

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
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
        </div>

        <div className="space-y-5 px-5 py-6 md:px-8">
          <div className="flex flex-wrap gap-2">
            {game.categories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
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
            <GameDetailPlayCta
              gameId={game.id}
              gameSlug={game.slug}
              playable={playable}
            />
            <GameDetailFavoriteButton
              gameId={game.id}
              gameSlug={game.slug}
            />
          </div>
        </div>
      </section>

      <SimilarGamesSection gameId={game.id} fallbackGames={similarGames} />
    </div>
  );
}
