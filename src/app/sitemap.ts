import type { MetadataRoute } from "next";
import { fetchGames, fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { env } from "@/config/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/discover",
    "/games",
    "/most-popular",
    "/hot-games",
    "/best-games",
    "/most-played",
    "/exclusive-games",
    "/trending",
    "/new",
    "/mobile",
    "/multiplayer",
    "/search",
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    const [games, home] = await Promise.all([
      fetchGames({ page: 1, pageSize: 500, sort: "newest" }),
      fetchHomeDiscoveries(),
    ]);

    const slugs = new Set<string>();
    for (const game of [
      ...games,
      ...home.popular,
      ...home.hotGames,
      ...home.bestGames,
      ...home.mostPlayed,
      ...home.exclusiveGames,
      ...home.trending,
      ...home.latest,
    ]) {
      if (game.slug) {
        slugs.add(game.slug);
      }
    }

    for (const slug of slugs) {
      entries.push({
        url: `${env.NEXT_PUBLIC_APP_URL}/game/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // Keep static routes if live catalog is temporarily unavailable.
  }

  return entries;
}
