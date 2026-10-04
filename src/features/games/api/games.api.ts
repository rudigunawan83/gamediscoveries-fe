import {
  getGameBySlug,
  getGames,
  getHomeDiscoveries,
  type ListGamesParams,
} from "@/lib/api/games";
import {
  mapGameDetail,
  mapGameSummaries,
  mapGameSummary,
} from "@/features/games/mappers/game.mapper";
import {
  getMockGameBySlug,
  mockGames,
} from "@/features/games/mock/games.mock";
import type { Game } from "@/types/game";
import type { HomeDiscoveriesDto } from "@/lib/api/types.games";
import type { ApiMeta } from "@/lib/api/types";

// Opt-in only. Default is live API so production builds never bake mock catalogs.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export type HomeDiscoveries = {
  featured: Game[];
  trending: Game[];
  latest: Game[];
  popular: Game[];
  mobile: Game[];
  multiplayer: Game[];
  hotGames: Game[];
  bestGames: Game[];
  mostPlayed: Game[];
  exclusiveGames: Game[];
};

export type GamesPageResult = {
  games: Game[];
  meta: ApiMeta | null;
};

export async function fetchGames(params: ListGamesParams = {}): Promise<Game[]> {
  const page = await fetchGamesPage(params);
  return page.games;
}

export async function fetchGamesPage(
  params: ListGamesParams = {},
): Promise<GamesPageResult> {
  if (USE_MOCK) {
    return {
      games: mockGames,
      meta: {
        page: 1,
        pageSize: mockGames.length,
        total: mockGames.length,
        totalPages: 1,
      },
    };
  }

  const response = await getGames({ page: 1, pageSize: 500, ...params });
  return {
    games: mapGameSummaries(response.data ?? []),
    meta: response.meta,
  };
}

export async function fetchGameBySlug(slug: string): Promise<Game | null> {
  if (USE_MOCK) {
    return getMockGameBySlug(slug) ?? null;
  }

  try {
    const response = await getGameBySlug(slug);
    return mapGameDetail(response.data);
  } catch {
    return null;
  }
}

export async function fetchHomeDiscoveries(): Promise<HomeDiscoveries> {
  if (USE_MOCK) {
    return {
      featured: mockGames.slice(0, 8),
      trending: mockGames.slice(0, 12),
      latest: mockGames.slice(0, 12),
      popular: mockGames.slice(0, 12),
      mobile: mockGames.filter((g) => g.mobileReady).slice(0, 12),
      multiplayer: mockGames.filter((g) => g.multiplayer).slice(0, 12),
      hotGames: mockGames.slice(0, 12),
      bestGames: mockGames.slice(0, 12),
      mostPlayed: mockGames.slice(0, 12),
      exclusiveGames: mockGames.slice(0, 12),
    };
  }

  const response = await getHomeDiscoveries();
  const data = response.data as HomeDiscoveriesDto;
  return {
    featured: mapGameSummaries(data.featured ?? []),
    trending: mapGameSummaries(data.trending ?? []),
    latest: mapGameSummaries(data.latest ?? []),
    popular: mapGameSummaries(data.popular ?? []),
    mobile: mapGameSummaries(data.mobile ?? []),
    multiplayer: mapGameSummaries(data.multiplayer ?? []),
    hotGames: mapGameSummaries(data.hotGames ?? []),
    bestGames: mapGameSummaries(data.bestGames ?? []),
    mostPlayed: mapGameSummaries(data.mostPlayed ?? []),
    exclusiveGames: mapGameSummaries(data.exclusiveGames ?? []),
  };
}

export { mapGameSummary };
