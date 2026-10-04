import {
  CURATED_COLLECTIONS,
  getCollectionBySlug,
} from "@/features/seo/data/collections";
import { fetchGames, fetchHomeDiscoveries } from "@/features/games/api/games.api";
import type { SeoCollection } from "@/features/seo/types";
import type { Game } from "@/types/game";

async function resolveGamesForCollection(
  collection: SeoCollection,
): Promise<Game[]> {
  if (collection.gameSlugs.length > 0) {
    const resolved: Game[] = [];
    for (const slug of collection.gameSlugs) {
      const matches = await fetchGames({
        page: 1,
        pageSize: 5,
        search: slug.replace(/-/g, " "),
        sort: "popular",
      });
      const hit = matches.find((g) => g.slug === slug);
      if (hit) resolved.push(hit);
    }
    return resolved;
  }

  const home = await fetchHomeDiscoveries();

  switch (collection.slug) {
    case "best-browser-games":
      return (home.bestGames.length ? home.bestGames : home.popular).slice(0, 24);
    case "best-mobile-games":
      return (
        home.mobile.length
          ? home.mobile
          : await fetchGames({
              page: 1,
              pageSize: 24,
              mobileReady: true,
              sort: "popular",
            })
      ).slice(0, 24);
    case "best-2-player-games":
    case "games-to-play-with-friends":
      return (
        home.multiplayer.length
          ? home.multiplayer
          : await fetchGames({
              page: 1,
              pageSize: 24,
              category: "Multiplayer",
              sort: "popular",
            })
      ).slice(0, 24);
    case "hidden-gems":
      return (home.latest.length ? home.latest : home.featured).slice(0, 24);
    default:
      return home.popular.slice(0, 24);
  }
}

export async function fetchResolvedCollection(
  slug: string,
): Promise<SeoCollection | null> {
  const base = getCollectionBySlug(slug);
  if (!base) return null;
  const games = await resolveGamesForCollection(base);
  return {
    ...base,
    games,
    gameSlugs: games.map((g) => g.slug),
  };
}

export async function fetchIndexableCollections(): Promise<SeoCollection[]> {
  const resolved: SeoCollection[] = [];
  for (const collection of CURATED_COLLECTIONS) {
    const item = await fetchResolvedCollection(collection.slug);
    if (item) resolved.push(item);
  }
  return resolved;
}
