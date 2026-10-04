import { mapGameSummary } from "@/features/games/mappers/game.mapper";
import type {
  HistoryItem,
  LibraryPageResult,
} from "@/features/my-games/types/my-games.types";
import { apiClient } from "@/lib/api/client";
import type { GameSummaryDto } from "@/lib/api/types.games";

interface HistoryItemDto {
  id: string;
  gameId: string;
  playedAt: string;
  durationSeconds: number;
  game: GameSummaryDto;
}

export async function fetchHistory(params: {
  page?: number;
  pageSize?: number;
}): Promise<LibraryPageResult<HistoryItem>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 24;
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const response = await apiClient.get<HistoryItemDto[]>(
    `/api/v1/users/me/history?${query.toString()}`,
  );

  const items = (response.data ?? []).map((item) => ({
    id: item.id,
    gameId: item.gameId,
    playedAt: item.playedAt,
    durationSeconds: item.durationSeconds ?? 0,
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

export async function recordHistory(input: {
  gameId: string;
  durationSeconds?: number;
}): Promise<void> {
  await apiClient.post("/api/v1/users/me/history", {
    gameId: input.gameId,
    durationSeconds: input.durationSeconds ?? 0,
  });
}
