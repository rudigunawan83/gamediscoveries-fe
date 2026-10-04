import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MonitorPlay, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GameBreadcrumbs } from "@/components/game/GameBreadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { GameReviewsSection } from "@/features/community/components/GameReviewsSection";
import { GameDetailFavoriteButton } from "@/features/my-games/components/GameDetailFavoriteButton";
import { GameDetailPlayCta } from "@/features/games/components/GameDetailPlayCta";
import { ShareButton } from "@/features/seo/components/ShareButton";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import {
  fetchGameBySlug,
  fetchGames,
} from "@/features/games/api/games.api";
import { SimilarGamesSection } from "@/features/recommendations/components/RecommendationSection";
import { isPlayableGame } from "@/features/game-player/utils/playerUrl";
import { env } from "@/config/env";
import { generateGameMetadata } from "@/lib/seo/metadata";
import { createMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbJsonLd,
  gameSoftwareJsonLd,
} from "@/lib/seo/structured-data";
import { shouldIndexGame } from "@/lib/seo/indexability";
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

  return generateGameMetadata(game);
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { slug } = await params;
  const game = await fetchGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const indexDecision = shouldIndexGame(game);
  if (!indexDecision.index && game.status === "archived") {
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

  const moreCategoryGames = (
    await fetchGames({
      page: 1,
      pageSize: 8,
      category: categorySlug ?? categoryName,
      sort: "newest",
    })
  ).filter((item) => item.id !== game.id);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Games", path: "/games" },
    ...(categorySlug && categoryName
      ? [{ name: categoryName, path: `/games/${categorySlug}` }]
      : []),
    { name: game.title, path: `/game/${game.slug}` },
  ];

  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          gameSoftwareJsonLd(game, playable),
          breadcrumbJsonLd(breadcrumbItems),
        ]}
      />

      <GameBreadcrumbs gameTitle={game.title} categories={game.categories} />

      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/50">
        <div className="relative aspect-[21/9] min-h-56 bg-muted">
          <Image
            src={game.coverUrl ?? game.thumbnailUrl}
            alt={`${game.title} gameplay`}
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
              <Badge
                key={category.id}
                variant="secondary"
                render={<Link href={`/games/${category.slug}`} />}
              >
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
            <ShareButton
              title={`Play ${game.title} online`}
              text={`Play ${game.title} free on GameDiscoveries`}
              url={`${env.NEXT_PUBLIC_APP_URL}/game/${game.slug}`}
              entityType="game"
              entityId={game.id}
            />
            <Button asChild variant="outline">
              <Link href={`/game/${game.slug}/community`}>Community</Link>
            </Button>
          </div>

          {game.description ? (
            <div className="max-w-3xl space-y-2">
              <h2 className="text-sm font-semibold text-white">About this game</h2>
              <p className="whitespace-pre-line text-muted-foreground">
                {game.description}
              </p>
            </div>
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
        </div>
      </section>

      <GameReviewsSection slug={game.slug} />

      <SimilarGamesSection gameId={game.id} fallbackGames={similarGames} />

      {moreCategoryGames.length > 0 && categoryName && categorySlug ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              More {categoryName} games
            </h2>
            <Link
              href={`/games/${categorySlug}`}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {moreCategoryGames.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                href={`/game/${item.slug}`}
                className="group overflow-hidden rounded-xl border border-border/50 bg-card/40"
              >
                <div className="relative aspect-video bg-muted">
                  <Image
                    src={item.thumbnailUrl}
                    alt={`${item.title} gameplay`}
                    fill
                    className="object-cover transition-transform group-hover:scale-[1.02]"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                </div>
                <p className="truncate px-2.5 py-2 text-sm font-medium">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <SeoRelatedLinks
        title="Keep discovering"
        links={[
          ...(categorySlug && categoryName
            ? [{ href: `/games/${categorySlug}`, label: `${categoryName} games` }]
            : []),
          { href: `/games-like/${game.slug}`, label: `Games like ${game.title}` },
          { href: `/game/${game.slug}/community`, label: "Community" },
          { href: "/collections", label: "Collections" },
          ...(game.mobileReady
            ? [{ href: "/mobile", label: "Mobile games" }]
            : []),
          ...(game.multiplayer
            ? [{ href: "/multiplayer", label: "Multiplayer" }]
            : []),
          { href: "/trending", label: "Trending" },
        ]}
      />
    </div>
  );
}
