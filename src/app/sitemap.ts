import type { MetadataRoute } from "next";
import { fetchSitemapGames } from "@/features/games/api/games.api";
import { fetchCategories } from "@/features/seo/api/categories.api";
import { fetchIndexableCollections } from "@/features/seo/api/collections.api";
import { buildSitemapEntries } from "@/lib/seo/sitemap-builder";

export const dynamic = "force-dynamic";

/**
 * A failed game list fails the whole sitemap (5xx) so crawlers retry, instead of
 * receiving a truncated sitemap that silently drops every game URL.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, categories, collections] = await Promise.all([
    fetchSitemapGames(),
    fetchCategories(),
    fetchIndexableCollections().catch(() => []),
  ]);
  return buildSitemapEntries({ games, categories, collections });
}
