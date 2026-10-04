import { mapGameSummary } from "@/features/games/mappers/game.mapper";
import type {
  FavoriteItem,
  LibraryPageResult,
} from "@/features/my-games/types/my-games.types";
import { apiClient } from "@/lib/api/client";
import type { GameSummaryDto } from "@/lib/api/types.games";

interface FavoriteItemDto {
  gameId: string;
  favoritedAt: string;
  game: GameSummaryDto;
}

export async function fetchFavorites(params: {
  page?: number;
  pageSize?: number;
}): Promise<LibraryPageResult<FavoriteItem>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 24;
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const response = await apiClient.get<FavoriteItemDto[]>(
    `/api/v1/users/me/favorites?${query.toString()}`,
  );

  const items = (response.data ?? []).map((item) => ({
    gameId: item.gameId,
    favoritedAt: item.favoritedAt,
    game: mapGameSummary(item.game),
  }));

  const meta = response.meta;
  const total = meta?.total ?? items.length;
  const totalPages = meta?.totalPages ?? (total > 0 ? 1 : 0);

  return {
    items,
    page: meta?.page ?? page,
    pageSize: meta?.pageSize ?? pageSize,
    total,
    totalPages,
    hasMore: (meta?.page ?? page) < totalPages,
  };
}

export async function addFavorite(gameId: string): Promise<void> {
  await apiClient.post("/api/v1/users/me/favorites", { gameId });
}

export async function removeFavorite(gameId: string): Promise<void> {
  await apiClient.delete(`/api/v1/users/me/favorites/${gameId}`);
}

export async function checkFavorite(gameId: string): Promise<boolean> {
  const response = await apiClient.get<{ favorited: boolean }>(
    `/api/v1/users/me/favorites/${gameId}`,
  );
  return Boolean(response.data?.favorited);
}
