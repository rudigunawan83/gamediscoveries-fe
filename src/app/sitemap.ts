import type { MetadataRoute } from "next";
import { fetchGamesPage } from "@/features/games/api/games.api";
import { fetchCategories } from "@/features/seo/api/categories.api";
import { fetchIndexableCollections } from "@/features/seo/api/collections.api";
import { SEO_CONFIG } from "@/lib/seo/config";
import { shouldIndexCategory, shouldIndexCollection } from "@/lib/seo/indexability";
import {
  gamesSitemapPartitionCount,
  sitemapEntry,
} from "@/lib/seo/sitemap-utils";

export const dynamic = "force-dynamic";

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
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

/** id 0 = static + categories + collections; id >= 1 = game partitions */
export async function generateSitemaps() {
  try {
    const first = await fetchGamesPage({
      page: 1,
      pageSize: 1,
      sort: "newest",
    });
    const total = first.meta?.total ?? 0;
    const partitions = gamesSitemapPartitionCount(total);
    return Array.from({ length: partitions + 1 }, (_, id) => ({ id }));
  } catch {
    return [{ id: 0 }, { id: 1 }];
  }
}

export default async function sitemap(props: {
  id: number | string;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(props.id);

  if (id === 0) {
    const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) =>
      sitemapEntry(route.path, {
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      }),
    );

    try {
      const [categories, collections] = await Promise.all([
        fetchCategories(),
        fetchIndexableCollections(),
      ]);

      for (const category of categories) {
        if (!shouldIndexCategory(category).index) continue;
        entries.push(
          sitemapEntry(`/games/${category.slug}`, {
            lastModified: category.lastContentAt,
            changeFrequency: "daily",
            priority: 0.75,
          }),
        );
      }

      for (const collection of collections) {
        if (!shouldIndexCollection(collection).index) continue;
        entries.push(
          sitemapEntry(`/collections/${collection.slug}`, {
            lastModified: collection.updatedAt,
            changeFrequency: "weekly",
            priority: 0.7,
          }),
        );
      }
    } catch {
      // Keep static routes if catalog APIs are temporarily unavailable.
    }

    return entries;
  }

  const partitionIndex = id - 1;
  const pageSize = Math.min(SEO_CONFIG.sitemapGamesPerPartition, 100);
  const pagesPerPartition = Math.ceil(
    SEO_CONFIG.sitemapGamesPerPartition / pageSize,
  );
  const startPage = partitionIndex * pagesPerPartition + 1;
  const entries: MetadataRoute.Sitemap = [];

  for (let page = startPage; page < startPage + pagesPerPartition; page += 1) {
    try {
      const result = await fetchGamesPage({
        page,
        pageSize,
        sort: "newest",
      });
      if (!result.games.length) break;

      for (const game of result.games) {
        if (!game.slug) continue;
        entries.push(
          sitemapEntry(`/game/${game.slug}`, {
            lastModified: game.publishedAt,
            changeFrequency: "weekly",
            priority: 0.6,
          }),
        );
      }

      if (result.meta && page >= result.meta.totalPages) break;
    } catch {
      break;
    }
  }

  return entries;
}
