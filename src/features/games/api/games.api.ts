import { getGameBySlug, getGames } from "@/lib/api/games";
import {
  getMockGameBySlug,
  mockGames,
} from "@/features/games/mock/games.mock";
import type { Game } from "@/types/game";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export async function fetchGames(): Promise<Game[]> {
  if (USE_MOCK) {
    return mockGames;
  }

  const response = await getGames();
  return response.data;
}

export async function fetchGameBySlug(slug: string): Promise<Game | null> {
  if (USE_MOCK) {
    return getMockGameBySlug(slug) ?? null;
  }

  try {
    const response = await getGameBySlug(slug);
    return response.data;
  } catch {
    return null;
  }
}
