import Link from "next/link";
import { notFound } from "next/navigation";
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

  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Games", path: "/games" },
            { name: game.title, path: `/game/${game.slug}` },
            { name: `Games like ${game.title}`, path: `/games-like/${game.slug}` },
          ]),
          itemListJsonLd(
            `Games like ${game.title}`,
            `/games-like/${game.slug}`,
            similar,
          ),
        ]}
      />

      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Games Like {game.title}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Similar free browser games based on shared{" "}
          {category ? `${category.name.toLowerCase()} ` : ""}
          catalog signals — category, popularity, and gameplay adjacency. These
          alternatives are drawn from verified GameDiscoveries catalog data.
        </p>
        <p className="text-sm text-muted-foreground">
          Looking for the original?{" "}
          <Link href={`/game/${game.slug}`} className="text-primary hover:underline">
            Play {game.title}
          </Link>
        </p>
      </header>

      <GameSection
        title="Similar games"
        description={`${similar.length} alternatives players also enjoy.`}
        games={similar}
        variant="discovery"
      />

      <section className="space-y-2">
        <h2 className="font-display text-xl font-semibold">
          Why these games are similar
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Similarity uses public catalog attributes such as category
          {category ? ` (${category.name})` : ""}, tags, and popularity — not
          personalized history — so crawlers and anonymous visitors see the same
          deterministic set.
        </p>
      </section>

      <SeoRelatedLinks
        links={[
          ...(category
            ? [{ href: `/games/${category.slug}`, label: `${category.name} games` }]
            : []),
          { href: `/game/${game.slug}/community`, label: `${game.title} community` },
          { href: "/collections", label: "Collections" },
          { href: "/trending", label: "Trending" },
        ]}
      />
    </div>
  );
}
