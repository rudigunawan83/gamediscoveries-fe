import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { GamePlayer } from "@/features/game-player/components/GamePlayer";
import { GameDetailPlayCta } from "@/features/games/components/GameDetailPlayCta";

vi.mock("@/lib/analytics/client", () => ({
  analytics: {
    track: vi.fn(),
    pageView: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

function renderWithQuery(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe("GamePlayer", () => {
  it("renders loading then iframe for a valid play url", () => {
    renderWithQuery(
      <GamePlayer
        gameId="g1"
        gameSlug="demo-game"
        title="Demo Game"
        playUrl="https://html5.gamemonetize.co/demo/"
        status="published"
        backHref="/game/demo-game"
      />,
    );

    expect(screen.getByText("Preparing your game")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enter fullscreen/i }),
    ).toBeInTheDocument();
    expect(screen.getByTitle("Playing Demo Game")).toBeInTheDocument();
  });

  it("renders unavailable error when play url is missing", () => {
    renderWithQuery(
      <GamePlayer
        gameId="g1"
        gameSlug="demo-game"
        title="Demo Game"
        playUrl={null}
        status="published"
        backHref="/game/demo-game"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Game Unavailable");
    expect(screen.getByRole("link", { name: "Back to Game" })).toHaveAttribute(
      "href",
      "/game/demo-game",
    );
  });
});

describe("GameDetailPlayCta", () => {
  it("renders PLAY NOW and links to the player route", () => {
    render(
      <GameDetailPlayCta gameId="g1" gameSlug="demo-game" playable />,
    );

    const link = screen.getByRole("link", { name: /play now/i });
    expect(link).toHaveAttribute("href", "/game/demo-game/play");
  });

  it("disables play when unavailable", () => {
    render(
      <GameDetailPlayCta gameId="g1" gameSlug="demo-game" playable={false} />,
    );
    expect(screen.getByRole("button", { name: /unavailable/i })).toBeDisabled();
  });
});
