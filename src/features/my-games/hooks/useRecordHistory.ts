"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordHistory } from "@/features/my-games/api/historyApi";
import { myGamesKeys } from "@/features/my-games/api/myGamesKeys";
import { useAuthStore } from "@/features/auth/stores/authStore";

export function useRecordHistory() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (input: { gameId: string; durationSeconds?: number }) => {
      if (!accessToken) {
        return;
      }
      await recordHistory(input);
    },
    onSuccess: () => {
      if (!accessToken) return;
      void queryClient.invalidateQueries({
        queryKey: myGamesKeys.historyRoot(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: myGamesKeys.all,
      });
    },
  });
}
