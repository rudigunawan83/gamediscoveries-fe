/** Central SEO configuration — do not hardcode thresholds in page components. */

export const SEO_CONFIG = {
  minGamesForCategoryIndexing: Number(
    process.env.SEO_MIN_GAMES_FOR_CATEGORY ?? 8,
  ),
  minGamesForCollectionIndexing: Number(
    process.env.SEO_MIN_GAMES_FOR_COLLECTION ?? 6,
  ),
  minGamesForGamesLikeIndexing: Number(
    process.env.SEO_MIN_GAMES_FOR_GAMES_LIKE ?? 6,
  ),
  minContentLength: Number(process.env.SEO_MIN_CONTENT_LENGTH ?? 40),
  minCommunityContentLength: Number(
    process.env.SEO_MIN_COMMUNITY_CONTENT_LENGTH ?? 80,
  ),
  enableProgrammaticPages:
    (process.env.SEO_ENABLE_PROGRAMMATIC_PAGES ?? "true") === "true",
  enableGamesLike: (process.env.SEO_ENABLE_GAMES_LIKE ?? "true") === "true",
  enableCommunityIndexing:
    (process.env.SEO_ENABLE_COMMUNITY_INDEXING ?? "true") === "true",
  enableStructuredData:
    (process.env.SEO_ENABLE_STRUCTURED_DATA ?? "true") === "true",
  defaultLocale: process.env.SEO_DEFAULT_LOCALE ?? "en",
  supportedLocales: (process.env.SEO_SUPPORTED_LOCALES ?? "en,id")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean),
  sitemapGamesPerPartition: Number(
    process.env.SEO_SITEMAP_GAMES_PER_PARTITION ?? 1000,
  ),
  sitemapMaxPartitions: Number(process.env.SEO_SITEMAP_MAX_PARTITIONS ?? 100),
} as const;

export type SeoConfig = typeof SEO_CONFIG;
