import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

  const t = await getTranslations("Discovery");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("Common");
  const gameCount = category.gameCount ?? popular.length;
  const lowerName = category.name.toLowerCase();
  const intro =
    category.description?.trim() ||
    t("categoryIntro", { category: lowerName, count: gameCount });

  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: tNav("home"), path: "/" },
            { name: tNav("games"), path: "/games" },
            { name: category.name, path: `/games/${category.slug}` },
          ]),
          itemListJsonLd(
            t("categoryTitle", { category: category.name }),
            `/games/${category.slug}`,
            popular,
          ),
        ]}
      />

      <header className="space-y-3">
        <nav aria-label={tCommon("breadcrumb")} className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-primary">
                {tNav("home")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/games" className="hover:text-primary">
                {tNav("games")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground" aria-current="page">
              {category.name}
            </li>
          </ol>
        </nav>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {t("categoryTitle", { category: category.name })}
        </h1>
        <p className="max-w-3xl text-muted-foreground">{intro}</p>
        <p className="text-xs text-muted-foreground">
          {t("categoryCount", { count: gameCount })}
          {!decision.index ? t("categoryNoindex") : null}
        </p>
      </header>

      <GameSection
        title={t("categoryPopularTitle", { category: category.name })}
        description={t("categoryPopularDescription", { category: lowerName })}
        games={popular}
        variant="discovery"
      />

      <GameSection
        title={t("categoryNewTitle", { category: category.name })}
        description={t("categoryNewDescription", { category: lowerName })}
        games={newest}
      />

      {mobile.length > 0 ? (
        <GameSection
          title={t("categoryMobileTitle", { category: category.name })}
          description={t("categoryMobileDescription", { category: lowerName })}
          games={mobile}
        />
      ) : null}

      <SeoRelatedLinks
        title={t("relatedDiscovery")}
        links={[
          { href: "/trending", label: t("linkTrending") },
          { href: "/new", label: t("linkNewDiscoveries") },
          { href: "/mobile", label: t("linkMobileGames") },
          { href: "/multiplayer", label: tNav("multiplayer") },
          { href: "/collections", label: tNav("collections") },
        ]}
      />
    </div>
  );
}
