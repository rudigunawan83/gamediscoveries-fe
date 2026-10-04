import type { MetadataRoute } from "next";
import { mockGames } from "@/features/games/mock/games.mock";
import { env } from "@/config/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/discover",
    "/games",
    "/trending",
    "/new",
    "/mobile",
    "/multiplayer",
    "/search",
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.7,
  }));

  for (const game of mockGames) {
    entries.push({
      url: `${env.NEXT_PUBLIC_APP_URL}/game/${game.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
