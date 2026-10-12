import type { MetadataRoute } from "next";
import type { SitemapGameDto } from "@/lib/api/games";
import { shouldIndexCategory, shouldIndexCollection } from "@/lib/seo/indexability";
import { sitemapEntry } from "@/lib/seo/sitemap-utils";
import type { SeoCategory, SeoCollection } from "@/features/seo/types";

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

export const STATIC_SITEMAP_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/games", priority: 0.9, changeFrequency: "daily" },
  { path: "/trending", priority: 0.8, changeFrequency: "hourly" },
  { path: "/new", priority: 0.8, changeFrequency: "daily" },
  { path: "/mobile", priority: 0.8, changeFrequency: "daily" },
  { path: "/multiplayer", priority: 0.8, changeFrequency: "daily" },
  { path: "/community", priority: 0.7, changeFrequency: "daily" },
  { path: "/collections", priority: 0.7, changeFrequency: "weekly" },
  { path: "/most-popular", priority: 0.7, changeFrequency: "daily" },
  { path: "/hot-games", priority: 0.7, changeFrequency: "daily" },
  { path: "/best-games", priority: 0.7, changeFrequency: "daily" },
  { path: "/most-played", priority: 0.7, changeFrequency: "daily" },
  { path: "/exclusive-games", priority: 0.7, changeFrequency: "weekly" },
];

/**
 * Lists only URLs whose own page would be indexable with a self-referencing canonical:
 * categories and collections pass the same gates as their metadata, and games come from
 * the API's canonical, published, playable list.
 */
export function buildSitemapEntries(input: {
  categories: SeoCategory[];
  collections: SeoCollection[];
  games: SitemapGameDto[];
}): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = STATIC_SITEMAP_ROUTES.map((route) =>
    sitemapEntry(route.path, {
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }),
  );

  for (const category of input.categories) {
    if (!shouldIndexCategory(category).index) continue;
    entries.push(
      sitemapEntry(`/games/${category.slug}`, {
        lastModified: category.lastContentAt,
        changeFrequency: "daily",
        priority: 0.75,
      }),
    );
  }

  for (const collection of input.collections) {
    if (!shouldIndexCollection(collection).index) continue;
    entries.push(
      sitemapEntry(`/collections/${collection.slug}`, {
        lastModified: collection.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    );
  }

  const seen = new Set<string>();
  for (const game of input.games) {
    if (!game.slug || seen.has(game.slug)) continue;
    seen.add(game.slug);
    entries.push(
      sitemapEntry(`/game/${game.slug}`, {
        lastModified: game.lastModified,
        changeFrequency: "weekly",
        priority: 0.6,
      }),
    );
  }

  return entries;
}
