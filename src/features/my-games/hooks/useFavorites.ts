"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFavorites } from "@/features/my-games/api/favoritesApi";
import { myGamesKeys } from "@/features/my-games/api/myGamesKeys";
import { useAuthStore } from "@/features/auth/stores/authStore";

export function useFavorites(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 24;
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: myGamesKeys.favorites(userId, page, pageSize),
    queryFn: () => fetchFavorites({ page, pageSize }),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}
