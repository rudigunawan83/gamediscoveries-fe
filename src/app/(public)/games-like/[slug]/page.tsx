import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import { fetchGameBySlug, fetchGames } from "@/features/games/api/games.api";
import { generateGamesLikeMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbJsonLd,
  itemListJsonLd,
} from "@/lib/seo/structured-data";
import { shouldIndexGamesLike } from "@/lib/seo/indexability";

export const dynamic = "force-dynamic";

interface GamesLikePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GamesLikePageProps) {
  const { slug } = await params;
  const game = await fetchGameBySlug(slug);
  if (!game) {
    return generateGamesLikeMetadata(
      {
        id: slug,
        slug,
        title: slug,
        thumbnailUrl: "",
        categories: [],
        tags: [],
      },
      0,
    );
  }

  const category = game.categories[0]?.slug ?? game.categories[0]?.name;
  const similar = (
    await fetchGames({
      page: 1,
      pageSize: 12,
      category,
      sort: "popular",
    })
  ).filter((item) => item.id !== game.id);

  return generateGamesLikeMetadata(game, similar.length);
}

export default async function GamesLikePage({ params }: GamesLikePageProps) {
  const { slug } = await params;
  const game = await fetchGameBySlug(slug);
  if (!game) notFound();

  const category = game.categories[0];
  const similar = (
    await fetchGames({
      page: 1,
      pageSize: 18,
      category: category?.slug ?? category?.name,
      sort: "popular",
    })
  ).filter((item) => item.id !== game.id);

  const decision = shouldIndexGamesLike(similar.length);
  if (!decision.index) notFound();

  const [t, tNav, tGame, tCommunity, tDiscovery] = await Promise.all([
    getTranslations("Seo"),
    getTranslations("Nav"),
    getTranslations("Game"),
    getTranslations("Community"),
    getTranslations("Discovery"),
  ]);
  const heading = t("gamesLikeHeading", { game: game.title });

  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: tNav("home"), path: "/" },
            { name: tNav("games"), path: "/games" },
            { name: game.title, path: `/game/${game.slug}` },
            { name: heading, path: `/games-like/${game.slug}` },
          ]),
          itemListJsonLd(heading, `/games-like/${game.slug}`, similar),
        ]}
      />

      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {heading}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {category
            ? t("gamesLikeIntroCategory", { category: category.name.toLowerCase() })
            : t("gamesLikeIntro")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t.rich("gamesLikeOriginal", {
            game: game.title,
            link: (chunks) => (
              <Link href={`/game/${game.slug}`} className="text-primary hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </header>

      <GameSection
        title={t("gamesLikeSectionTitle")}
        description={t("gamesLikeSectionDescription", { count: similar.length })}
        games={similar}
        variant="discovery"
      />

      <section className="space-y-2">
        <h2 className="font-display text-xl font-semibold">
          {t("gamesLikeWhyTitle")}
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {category
            ? t("gamesLikeWhyCategory", { category: category.name })
            : t("gamesLikeWhy")}
        </p>
      </section>

      <SeoRelatedLinks
        links={[
          ...(category
            ? [
                {
                  href: `/games/${category.slug}`,
                  label: tGame("categoryGames", { category: category.name }),
                },
              ]
            : []),
          {
            href: `/game/${game.slug}/community`,
            label: tCommunity("gameCommunityTitle", { game: game.title }),
          },
          { href: "/collections", label: tNav("collections") },
          { href: "/trending", label: tDiscovery("linkTrending") },
        ]}
      />
    </div>
  );
}
