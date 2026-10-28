import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonitoringGamificationView } from "@/features/admin-monitoring/components/MonitoringGamificationView";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { MonitoringGamification } from "@/lib/api/monitoring";

const getMonitoringGamification = vi.fn();

vi.mock("@/lib/api/monitoring", () => ({
  getMonitoringGamification: (...args: unknown[]) => getMonitoringGamification(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

const shares = (keys: string[], counts: number[]) => keys.map((key, index) => ({ key, count: counts[index] ?? 0 }));

const gamification: MonitoringGamification = {
  range: "30d",
  from: "2026-09-11T00:00:00Z",
  to: "2026-10-11T00:00:00Z",
  generatedAt: "2026-10-11T00:00:00Z",
  xpAwarded: { value: 245032, changePercent: 12.4 },
  activePlayers: { value: 2834, changePercent: null },
  missionCompletions: { value: 156, changePercent: 22.1 },
  achievementsUnlocked: { value: 48, changePercent: -4 },
  activeStreaks: { value: 7, changePercent: null },
  trend: [
    { bucket: "2026-10-10T00:00:00Z", xp: 500, players: 1, dailyMissions: 3, weeklyMissions: 1, achievements: 7 },
    { bucket: "2026-10-11T00:00:00Z", xp: 130, players: 1, dailyMissions: 0, weeklyMissions: 0, achievements: 2 },
  ],
  achievementsByDifficulty: shares(["EASY", "MEDIUM", "HARD", "EPIC", "LEGENDARY"], [11, 1]),
  levels: shares(["1_5", "6_10", "11_15", "16_20", "21_30", "31_50", "51_plus"], [2, 1]),
  streaks: shares(["1_3", "4_7", "8_14", "15_30", "31_plus"], [5, 2]),
  missionRate: { completed: 7, inProgress: 0, notStarted: 11, expired: 3, completionRate: 33.3 },
  topPlayers: [{ userId: "u-1", player: "ray83", level: 6, xp: 1130, changePercent: null }],
  topMissions: [{ title: "Play 2 Games", type: "DAILY", completed: 2, assigned: 5, completionRate: 40 }],
  topAchievements: [{ title: "Collector", difficulty: "MEDIUM", unlocks: 1 }],
  recentXp: [
    {
      at: "2026-10-11T05:01:09Z",
      userId: "u-1",
      player: "ray83",
      description: "Review created",
      source: "REVIEW_CREATED",
      xp: 30,
    },
  ],
  recentAchievements: [
    { at: "2026-10-11T05:00:22Z", userId: "u-1", player: "ray83", achievement: "First Review", difficulty: "EASY" },
  ],
  recentMissions: [
    { at: "2026-10-10T00:19:36Z", userId: "u-1", player: "ray83", mission: "Discover a New Game", type: "DAILY", rewardXp: 50 },
  ],
};

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MonitoringGamificationView />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getMonitoringGamification.mockReset();
  useAuthStore.setState({ accessToken: null, user: null });
});

afterEach(() => {
  cleanup();
});

describe("MonitoringGamificationView", () => {
  it("blocks users without the super admin role", () => {
    useAuthStore.setState({ accessToken: "token", user: { roles: ["User"] } as never });
    renderView();

    expect(screen.getByRole("alert")).toHaveTextContent("Super admin access is required");
    expect(getMonitoringGamification).not.toHaveBeenCalled();
  });

  it("renders real gamification metrics", async () => {
    getMonitoringGamification.mockResolvedValue({ data: gamification });
    useAuthStore.setState({ accessToken: "token", user: { roles: ["SuperAdmin"] } as never });
    renderView();

    expect(await screen.findByText("245,032")).toBeInTheDocument();
    expect(getMonitoringGamification).toHaveBeenCalledWith({ range: "30d" }, false);
    expect(screen.getByRole("img", { name: "Mission completions over time" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Completion Rate: 21" })).toBeInTheDocument();
    expect(screen.getAllByText("33.3%")).toHaveLength(2);
    expect(screen.getByText("4–7 days")).toBeInTheDocument();
    expect(screen.getByText("51+")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "ray83" })[0]).toHaveAttribute("href", "/admin/gamification/users/u-1");
    expect(screen.getByText("Play 2 Games")).toBeInTheDocument();
    expect(screen.getByText("40.0%")).toBeInTheDocument();
    expect(screen.getByText("Collector")).toBeInTheDocument();
    expect(screen.getByText("Review created")).toBeInTheDocument();
    expect(screen.getByText("+30")).toBeInTheDocument();
    expect(screen.getByText("Discover a New Game")).toBeInTheDocument();
  });

  it("shows empty states when there is no activity", async () => {
    getMonitoringGamification.mockResolvedValue({
      data: {
        ...gamification,
        trend: [{ bucket: "2026-10-11T00:00:00Z", xp: 0, players: 0, dailyMissions: 0, weeklyMissions: 0, achievements: 0 }],
        achievementsByDifficulty: shares(["EASY"], [0]),
        levels: shares(["1_5"], [0]),
        streaks: shares(["1_3"], [0]),
        missionRate: { completed: 0, inProgress: 0, notStarted: 0, expired: 0, completionRate: null },
        topPlayers: [],
        topMissions: [],
        topAchievements: [],
        recentXp: [],
        recentAchievements: [],
        recentMissions: [],
      },
    });
    useAuthStore.setState({ accessToken: "token", user: { roles: ["SuperAdmin"] } as never });
    renderView();

    expect(await screen.findByText("No XP was awarded in this range.")).toBeInTheDocument();
    expect(screen.getByText("No missions were completed in this range.")).toBeInTheDocument();
    expect(screen.getByText("No player has an active streak right now.")).toBeInTheDocument();
    expect(screen.getByText("No players have progress yet.")).toBeInTheDocument();
    expect(screen.getAllByText("No missions were assigned in this range.")).toHaveLength(2);
    expect(screen.getByText("No XP transactions yet.")).toBeInTheDocument();
  });
});
