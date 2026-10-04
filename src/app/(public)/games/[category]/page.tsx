import Link from "next/link";
import { notFound } from "next/navigation";
import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import { fetchCategoryBySlug } from "@/features/seo/api/categories.api";
import { fetchGames } from "@/features/games/api/games.api";
import { generateCategoryMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbJsonLd,
  itemListJsonLd,
} from "@/lib/seo/structured-data";
import { shouldIndexCategory } from "@/lib/seo/indexability";
import { categoryDescription } from "@/lib/seo/descriptions";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) {
    return generateCategoryMetadata({
      id: slug,
      slug,
      name: slug,
      gameCount: 0,
    });
  }
  return generateCategoryMetadata(category);
}

export default async function CategoryGamesPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) notFound();

  const decision = shouldIndexCategory(category);
  const [popular, newest, mobile] = await Promise.all([
    fetchGames({
      page: 1,
      pageSize: 24,
      category: category.slug,
      sort: "popular",
    }),
    fetchGames({
      page: 1,
      pageSize: 24,
      category: category.slug,
      sort: "newest",
    }),
    fetchGames({
      page: 1,
      pageSize: 12,
      category: category.slug,
      mobileReady: true,
      sort: "popular",
    }),
  ]);

  if (!decision.index && popular.length === 0) {
    notFound();
  }

  const intro =
    category.description?.trim() ||
    categoryDescription(category.name, category.gameCount ?? popular.length);

  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Games", path: "/games" },
            { name: category.name, path: `/games/${category.slug}` },
          ]),
          itemListJsonLd(
            `${category.name} Games`,
            `/games/${category.slug}`,
            popular,
          ),
        ]}
      />

      <header className="space-y-3">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/games" className="hover:text-primary">
                Games
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground" aria-current="page">
              {category.name}
            </li>
          </ol>
        </nav>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {category.name} Games
        </h1>
        <p className="max-w-3xl text-muted-foreground">{intro}</p>
        <p className="text-xs text-muted-foreground">
          {category.gameCount ?? popular.length} games in catalog
          {!decision.index
            ? " · temporarily noindex (below quality threshold)"
            : null}
        </p>
      </header>

      <GameSection
        title={`Popular ${category.name} Games`}
        description={`Top ${category.name.toLowerCase()} picks players are enjoying now.`}
        games={popular}
        variant="discovery"
      />

      <GameSection
        title={`New ${category.name} Games`}
        description={`Recently added ${category.name.toLowerCase()} titles.`}
        games={newest}
      />

      {mobile.length > 0 ? (
        <GameSection
          title={`Mobile ${category.name} Games`}
          description={`Mobile-ready ${category.name.toLowerCase()} games for on-the-go play.`}
          games={mobile}
        />
      ) : null}

      <SeoRelatedLinks
        title="Related discovery"
        links={[
          { href: "/trending", label: "Trending" },
          { href: "/new", label: "New discoveries" },
          { href: "/mobile", label: "Mobile games" },
          { href: "/multiplayer", label: "Multiplayer" },
          { href: "/collections", label: "Collections" },
        ]}
      />
    </div>
  );
}
