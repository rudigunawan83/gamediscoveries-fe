"use client";

import { useQuery } from "@tanstack/react-query";
import { checkFavorite } from "@/features/my-games/api/favoritesApi";
import { myGamesKeys } from "@/features/my-games/api/myGamesKeys";
import { useAuthStore } from "@/features/auth/stores/authStore";

export function useFavoriteStatus(gameId: string, enabled = true) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: myGamesKeys.favoriteStatus(userId, gameId),
    queryFn: () => checkFavorite(gameId),
    enabled: Boolean(accessToken && gameId && enabled),
    staleTime: 60_000,
  });
}
