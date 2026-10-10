"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  addFavorite,
  removeFavorite,
} from "@/features/my-games/api/favoritesApi";
import { myGamesKeys } from "@/features/my-games/api/myGamesKeys";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { analytics } from "@/lib/analytics/client";
type ToggleFavoriteInput = {
  gameId: string;
  isFavorite: boolean;
  source?: string;
  callbackUrl?: string;
};

export function useFavoriteGame() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async ({ gameId, isFavorite }: ToggleFavoriteInput) => {
      if (!accessToken) {
        throw new Error("AUTH_REQUIRED");
      }
      if (isFavorite) {
        await removeFavorite(gameId);
        return { gameId, nextFavorite: false };
      }
      await addFavorite(gameId);
      return { gameId, nextFavorite: true };
    },
    onSuccess: (result, variables) => {
      const source = variables.source ?? "my_games";
      if (result.nextFavorite) {
        analytics.track("favorite_added", {
          gameId: result.gameId,
          source,
        });
      } else {
        analytics.track("favorite_removed", {
          gameId: result.gameId,
          source,
        });
      }

      void queryClient.invalidateQueries({
        queryKey: myGamesKeys.favoritesRoot(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: myGamesKeys.all,
      });
      void queryClient.invalidateQueries({
        queryKey: myGamesKeys.favoriteStatus(userId, result.gameId),
      });
      queryClient.setQueryData(
        myGamesKeys.favoriteStatus(userId, result.gameId),
        result.nextFavorite,
      );
    },
    onError: (error, variables) => {
      if (error instanceof Error && error.message === "AUTH_REQUIRED") {
        const callback =
          variables.callbackUrl ||
          (typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : "/my-games");
        router.push(`/login?callbackUrl=${encodeURIComponent(callback)}`);
      }
    },
  });
}
