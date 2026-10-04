"use client";

import { useFavorites } from "@/features/my-games/hooks/useFavorites";
import { useHistoryPreview } from "@/features/my-games/hooks/useHistory";

export function useMyGamesOverview() {
  const favorites = useFavorites({ page: 1, pageSize: 6 });
  const history = useHistoryPreview(6);

  const historyItems = history.data?.pages.flatMap((page) => page.items) ?? [];
  const favoriteItems = favorites.data?.items ?? [];
  const continuePlaying = historyItems.slice(0, 4);

  const isEmpty =
    !favorites.isPending &&
    !history.isPending &&
    favoriteItems.length === 0 &&
    historyItems.length === 0;

  return {
    favorites,
    history,
    favoriteItems,
    historyItems,
    continuePlaying,
    isEmpty,
  };
}
