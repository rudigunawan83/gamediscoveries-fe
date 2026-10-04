import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { SEO_CONFIG } from "@/lib/seo/config";

export function sitemapEntry(
  path: string,
  options?: {
    lastModified?: Date | string | null;
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
  },
): MetadataRoute.Sitemap[number] {
  return {
    url: `${env.NEXT_PUBLIC_APP_URL}${path === "/" ? "" : path}`,
    lastModified: options?.lastModified
      ? new Date(options.lastModified)
      : undefined,
    changeFrequency: options?.changeFrequency,
    priority: options?.priority,
  };
}

export function gamesSitemapPartitionCount(totalGames: number): number {
  const per = SEO_CONFIG.sitemapGamesPerPartition;
  const needed = Math.max(1, Math.ceil(totalGames / per));
  return Math.min(needed, SEO_CONFIG.sitemapMaxPartitions);
}
