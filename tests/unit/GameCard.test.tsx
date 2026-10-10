import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameCard } from "@/components/game/GameCard";
import { mockGames } from "@/features/games/mock/games.mock";
import { renderWithIntl } from "./helpers/intl";

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    accessToken: null,
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("GameCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders game title and category metadata", () => {
    const game = mockGames[0];
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderWithIntl(
      <QueryClientProvider client={client}>
        <GameCard game={game} />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: game.title })).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", `/game/${game.slug}`);
    expect(
      screen.getByRole("button", { name: /add to favorites/i }),
    ).toBeInTheDocument();
  });

  it("localizes labels but keeps the game title", () => {
    const game = mockGames[0];
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderWithIntl(
      <QueryClientProvider client={client}>
        <GameCard game={game} />
      </QueryClientProvider>,
      "id",
    );

    expect(screen.getByRole("heading", { name: game.title })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah ke favorit" })).toBeInTheDocument();
    expect(screen.getByText("Main")).toBeInTheDocument();
  });
});
