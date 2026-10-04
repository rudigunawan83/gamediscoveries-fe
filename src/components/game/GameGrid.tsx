import { GameCard } from "@/components/game/GameCard";
import type { Game } from "@/types/game";

interface GameGridProps {
  games: Game[];
  variant?: "default" | "discovery";
}

export function GameGrid({ games, variant = "default" }: GameGridProps) {
  return (
    <div
      className={
        variant === "discovery"
          ? "grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
          : "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      }
    >
      {games.map((game) => (
        <GameCard key={game.id} game={game} variant={variant} />
      ))}
    </div>
  );
}
