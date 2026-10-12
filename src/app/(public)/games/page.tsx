import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageLinks } from "@/components/common/PageLinks";
import { GameSection } from "@/components/game/GameSection";
import { fetchGamesPage } from "@/features/games/api/games.api";
import { fetchCategories } from "@/features/seo/api/categories.api";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { shouldIndexCategory } from "@/lib/seo/indexability";
import { createMetadata } from "@/lib/seo/metadata";
import { pageHref, parsePageParam } from "@/lib/seo/pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 48;

type GamesPageProps = {
  searchParams: Promise<{ q?: string; page?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: GamesPageProps) {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const [t, tDiscovery] = await Promise.all([
    getTranslations("Seo"),
    getTranslations("Discovery"),
  ]);
  const metadata = await createMetadata({
    title: page > 1 ? `${t("gamesTitle")} · ${tDiscovery("pageNumber", { page })}` : t("gamesTitle"),
    description: t("gamesDescription"),
    path: "/games",
  });
  if (page === 1) return metadata;

  // Each catalog page is its own canonical URL; pointing them all at page 1 would hide their games.
  const url = buildCanonicalUrl("/games") + `?page=${page}`;
  return {
    ...metadata,
    alternates: { ...metadata.alternates, canonical: url },
    openGraph: { ...metadata.openGraph, url },
  };
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const params = await searchParams;
  if (params.q?.trim()) {
    permanentRedirect(`/search?q=${encodeURIComponent(params.q.trim())}`);
  }

  const page = parsePageParam(params.page);
  const rawPage = params.page;
  if (rawPage !== undefined && (Array.isArray(rawPage) || page === 1 || rawPage !== String(page))) {
    permanentRedirect(pageHref("/games", page));
  }

  const [result, categories, t] = await Promise.all([
    fetchGamesPage({ page, pageSize: PAGE_SIZE, sort: "newest" }),
    fetchCategories(),
    getTranslations("Discovery"),
  ]);
  const totalPages = Math.max(1, result.meta?.totalPages ?? 1);
  if (page > totalPages) notFound();

  const browseCategories = categories
    .filter((category) => shouldIndexCategory(category).index)
    .sort((a, b) => (b.gameCount ?? 0) - (a.gameCount ?? 0));

  return (
    <div className="space-y-8">
      {browseCategories.length > 0 ? (
        <nav aria-label={t("browseCategories")} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{t("browseCategories")}</h2>
          <ul className="flex flex-wrap gap-2">
            {browseCategories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/games/${category.slug}`}
                  className="inline-flex rounded-full border border-white/10 px-3 py-1.5 text-sm hover:border-primary/60 hover:text-primary"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <GameSection
        title={t("newestTitle")}
        description={t("catalogPageDescription", {
          page,
          pages: totalPages,
          total: result.meta?.total ?? result.games.length,
        })}
        games={result.games}
        variant="discovery"
      />

      <PageLinks basePath="/games" page={page} totalPages={totalPages} />
    </div>
  );
}
