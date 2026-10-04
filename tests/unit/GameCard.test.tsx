import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GameCard } from "@/components/game/GameCard";
import { mockGames } from "@/features/games/mock/games.mock";

describe("GameCard", () => {
  it("renders game title and category metadata", () => {
    const game = mockGames[0];
    render(<GameCard game={game} />);

    expect(screen.getByRole("heading", { name: game.title })).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", `/game/${game.slug}`);
    expect(
      screen.getByRole("button", { name: /add game to favorites/i }),
    ).toBeInTheDocument();
  });
});
