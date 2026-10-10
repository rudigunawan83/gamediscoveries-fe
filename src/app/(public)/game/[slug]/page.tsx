import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MonitorPlay, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GameBreadcrumbs } from "@/components/game/GameBreadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { GameReviewsSection } from "@/features/community/components/GameReviewsSection";
import { GameDetailFavoriteButton } from "@/features/my-games/components/GameDetailFavoriteButton";
import { GameDetailPlayCta } from "@/features/games/components/GameDetailPlayCta";
import { MobileGameDetail } from "@/features/mobile-tabs/components/MobileGameDetail";
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
    const tSeo = await getTranslations("Seo");
    return createMetadata({
      title: tSeo("gameNotFound"),
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

  const t = await getTranslations("Game");
  const tNav = await getTranslations("Nav");
  const tDiscovery = await getTranslations("Discovery");
  const tCommon = await getTranslations("Common");
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
    { name: tNav("home"), path: "/" },
    { name: tNav("games"), path: "/games" },
    ...(categorySlug && categoryName
      ? [{ name: categoryName, path: `/games/${categorySlug}` }]
      : []),
    { name: game.title, path: `/game/${game.slug}` },
  ];

  return (
    <>
    <JsonLd
      data={[
        gameSoftwareJsonLd(game, playable),
        breadcrumbJsonLd(breadcrumbItems),
      ]}
    />
    <div className="lg:hidden">
      <MobileGameDetail
        game={game}
        playable={playable}
        shareUrl={`${env.NEXT_PUBLIC_APP_URL}/game/${game.slug}`}
        fallbackSimilar={similarGames}
      />
    </div>
    <div className="hidden space-y-10 lg:block">
      <GameBreadcrumbs gameTitle={game.title} categories={game.categories} />

      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/50">
        <div className="relative aspect-[21/9] min-h-56 bg-muted">
          <Image
            src={game.coverUrl ?? game.thumbnailUrl}
            alt={t("gameplayAlt", { title: game.title })}
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
              <Badge variant="outline">
                {game.orientation === "portrait"
                  ? t("portrait")
                  : game.orientation === "landscape"
                    ? t("landscape")
                    : t("anyOrientation")}
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
              {game.mobileReady ? <span>{t("mobileReady")}</span> : null}
              {game.multiplayer ? <span>{tNav("multiplayer")}</span> : null}
              {game.developer ? (
                <span>{t("byDeveloper", { developer: game.developer })}</span>
              ) : null}
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
              orientation={game.orientation}
            />
            <GameDetailFavoriteButton
              gameId={game.id}
              gameSlug={game.slug}
            />
            <ShareButton
              title={t("shareTitle", { title: game.title })}
              text={t("shareText", { title: game.title })}
              url={`${env.NEXT_PUBLIC_APP_URL}/game/${game.slug}`}
              entityType="game"
              entityId={game.id}
            />
            <Button asChild variant="outline">
              <Link href={`/game/${game.slug}/community`}>{tNav("community")}</Link>
            </Button>
          </div>

          {game.description ? (
            <div className="max-w-3xl space-y-2">
              <h2 className="text-sm font-semibold text-white">{t("aboutTitle")}</h2>
              <p className="whitespace-pre-line text-muted-foreground">
                {game.description}
              </p>
            </div>
          ) : null}

          {game.instructions ? (
            <div className="max-w-3xl rounded-2xl border border-border/50 bg-secondary/30 p-4">
              <h2 className="mb-1 text-sm font-semibold text-white">{t("howToPlayTitle")}</h2>
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
              {t("moreInCategory", { category: categoryName })}
            </h2>
            <Link
              href={`/games/${categorySlug}`}
              className="text-sm text-primary hover:underline"
            >
              {tCommon("viewAll")}
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
                    alt={t("gameplayAlt", { title: item.title })}
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
        title={t("keepDiscovering")}
        links={[
          ...(categorySlug && categoryName
            ? [{ href: `/games/${categorySlug}`, label: t("categoryGames", { category: categoryName }) }]
            : []),
          { href: `/games-like/${game.slug}`, label: t("gamesLike", { title: game.title }) },
          { href: `/game/${game.slug}/community`, label: tNav("community") },
          { href: "/collections", label: tNav("collections") },
          ...(game.mobileReady
            ? [{ href: "/mobile", label: tDiscovery("linkMobileGames") }]
            : []),
          ...(game.multiplayer
            ? [{ href: "/multiplayer", label: tNav("multiplayer") }]
            : []),
          { href: "/trending", label: tDiscovery("linkTrending") },
        ]}
      />
    </div>
    </>
  );
}
