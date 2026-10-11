import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonitoringGamesView } from "@/features/admin-monitoring/components/MonitoringGamesView";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { MonitoringGames } from "@/lib/api/monitoring";

const getMonitoringGames = vi.fn();

vi.mock("@/lib/api/monitoring", () => ({
  getMonitoringGames: (...args: unknown[]) => getMonitoringGames(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

const games: MonitoringGames = {
  range: "30d",
  from: "2026-09-11T00:00:00Z",
  to: "2026-10-11T00:00:00Z",
  generatedAt: "2026-10-11T00:00:00Z",
  totalGames: { value: 1245, changePercent: 5.2 },
  totalPlays: { value: 320, changePercent: 18.7 },
  averagePlaytime: { seconds: 504, changePercent: 12.5 },
  activeGames: { value: 42, changePercent: null },
  launchOutcomes: { reason: "The game player does not report load failures." },
  trend: [
    { bucket: "2026-10-10T00:00:00Z", plays: 120, uniquePlayers: 40, averagePlaytimeSeconds: 480 },
    { bucket: "2026-10-11T00:00:00Z", plays: 200, uniquePlayers: 60, averagePlaytimeSeconds: null },
  ],
  playtimeDistribution: [
    { key: "lt_1m", sessions: 10 },
    { key: "1_5m", sessions: 20 },
    { key: "5_10m", sessions: 0 },
    { key: "10_30m", sessions: 5 },
    { key: "30_60m", sessions: 0 },
    { key: "gt_60m", sessions: 1 },
  ],
  topGames: [
    {
      title: "Space Runner",
      slug: "space-runner",
      thumbnailUrl: null,
      plays: 90,
      uniquePlayers: 33,
      averagePlaytimeSeconds: 734,
    },
  ],
  categories: [
    { name: "Action", plays: 150 },
    { name: "Puzzle", plays: 75 },
  ],
  newVsReturning: { newPlayers: 3, returningPlayers: 1 },
};

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MonitoringGamesView />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getMonitoringGames.mockReset();
  useAuthStore.setState({ accessToken: null, user: null });
});

afterEach(() => {
  cleanup();
});

describe("MonitoringGamesView", () => {
  it("blocks users without the super admin role", () => {
    useAuthStore.setState({ accessToken: "token", user: { roles: ["User"] } as never });
    renderView();

    expect(screen.getByRole("alert")).toHaveTextContent("Super admin access is required");
    expect(getMonitoringGames).not.toHaveBeenCalled();
  });

  it("renders real game metrics and keeps launch outcomes unavailable", async () => {
    getMonitoringGames.mockResolvedValue({ data: games });
    useAuthStore.setState({ accessToken: "token", user: { roles: ["SuperAdmin"] } as never });
    renderView();

    expect(await screen.findByText("1,245")).toBeInTheDocument();
    expect(getMonitoringGames).toHaveBeenCalledWith("30d", false);
    expect(screen.getByText("8m 24s")).toBeInTheDocument();
    expect(screen.getAllByText("The game player does not report load failures.")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /Space Runner/ })).toHaveAttribute("href", "/game/space-runner");
    expect(screen.getByText("12m 14s")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("10–30 min")).toBeInTheDocument();
    expect(screen.getByText("New Players")).toBeInTheDocument();
    expect(screen.getByText("75.0%")).toBeInTheDocument();
  });
});
