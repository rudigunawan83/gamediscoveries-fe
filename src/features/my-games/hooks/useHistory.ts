"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchHistory } from "@/features/my-games/api/historyApi";
import { myGamesKeys } from "@/features/my-games/api/myGamesKeys";
import { useAuthStore } from "@/features/auth/stores/authStore";

export function useHistory(pageSize = 24) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);

  return useInfiniteQuery({
    queryKey: myGamesKeys.history(userId, 1, pageSize),
    queryFn: ({ pageParam }) =>
      fetchHistory({ page: pageParam, pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useHistoryPreview(pageSize = 6) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);

  return useInfiniteQuery({
    queryKey: myGamesKeys.history(userId, 1, pageSize),
    queryFn: ({ pageParam }) =>
      fetchHistory({ page: pageParam, pageSize }),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}
