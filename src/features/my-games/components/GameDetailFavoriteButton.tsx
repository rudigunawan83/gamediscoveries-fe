"use client";

import { FavoriteButton } from "@/features/my-games/components/FavoriteButton";

type GameDetailFavoriteButtonProps = {
  gameId: string;
  gameSlug: string;
};

export function GameDetailFavoriteButton({
  gameId,
  gameSlug,
}: GameDetailFavoriteButtonProps) {
  return (
    <FavoriteButton
      gameId={gameId}
      source="game_detail"
      variant="labeled"
      size="lg"
      callbackUrl={`/game/${gameSlug}`}
    />
  );
}
