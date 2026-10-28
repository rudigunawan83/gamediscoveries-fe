import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonitoringUsersView } from "@/features/admin-monitoring/components/MonitoringUsersView";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { MonitoringUsers } from "@/lib/api/monitoring";

const getMonitoringUsers = vi.fn();

vi.mock("@/lib/api/monitoring", () => ({
  getMonitoringUsers: (...args: unknown[]) => getMonitoringUsers(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

const emptyWeeks = [null, null, null, null, null, null, null, null];

const users: MonitoringUsers = {
  range: "30d",
  from: "2026-09-11T00:00:00Z",
  to: "2026-10-11T00:00:00Z",
  generatedAt: "2026-10-11T00:00:00Z",
  dau: { value: 1245, changePercent: 12.4 },
  wau: { value: 2834, changePercent: null },
  mau: { value: 6621, changePercent: -3.1 },
  retentionRate: { value: 42.6, changePercent: 6.8 },
  newUsers: { value: 342, changePercent: 15.2 },
  activity: [
    { bucket: "2026-10-10T00:00:00Z", activeUsers: 40, newUsers: 10, returningUsers: 30 },
    { bucket: "2026-10-11T00:00:00Z", activeUsers: 60, newUsers: 25, returningUsers: 35 },
  ],
  cohorts: [
    { weekStart: "2026-08-17T00:00:00Z", users: 0, retention: [null, ...emptyWeeks] },
    { weekStart: "2026-09-28T00:00:00Z", users: 80, retention: [100, 31.3, 18.8, null, null, null, null, null, null] },
    { weekStart: "2026-10-05T00:00:00Z", users: 50, retention: [100, ...emptyWeeks] },
  ],
  retention: [
    { day: "2026-10-10T00:00:00Z", d1: 30, d7: null, d30: null },
    { day: "2026-10-11T00:00:00Z", d1: 25, d7: 12.5, d30: null },
  ],
  engagement: {
    gamesPerPlayer: { value: 5.2, changePercent: 8.3 },
    averageSessionDuration: { seconds: 504, changePercent: 12.1 },
    sessionsPerUser: { value: null, changePercent: null },
    pagesPerSession: { value: 12.4, changePercent: 5.6 },
  },
  distribution: { new: 342, returning: 903, lapsed: 0, inactive: 255 },
  topGames: [
    {
      title: "Space Runner",
      slug: "space-runner",
      thumbnailUrl: null,
      activeUsers: 48,
      repeatRate: 48.2,
      changePercent: null,
    },
  ],
  heatmap: [{ day: 3, hour: 14, users: 9 }],
  acquisition: [{ source: "organic_search", users: 184, returnRate: null, changePercent: 14 }],
};

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MonitoringUsersView />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getMonitoringUsers.mockReset();
  useAuthStore.setState({ accessToken: null, user: null });
});

afterEach(() => {
  cleanup();
});

describe("MonitoringUsersView", () => {
  it("blocks users without the super admin role", () => {
    useAuthStore.setState({ accessToken: "token", user: { roles: ["User"] } as never });
    renderView();

    expect(screen.getByRole("alert")).toHaveTextContent("Super admin access is required");
    expect(getMonitoringUsers).not.toHaveBeenCalled();
  });

  it("renders real user and retention metrics", async () => {
    getMonitoringUsers.mockResolvedValue({ data: users });
    useAuthStore.setState({ accessToken: "token", user: { roles: ["SuperAdmin"] } as never });
    renderView();

    expect(await screen.findByText("1,245")).toBeInTheDocument();
    expect(getMonitoringUsers).toHaveBeenCalledWith({ range: "30d" }, false);
    expect(screen.getByText("42.6%")).toBeInTheDocument();
    expect(screen.getByText("Sep 28 – Oct 4")).toBeInTheDocument();
    expect(screen.getByText("31.3%")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "D1, D7, and D30 retention by day" })).toBeInTheDocument();
    expect(screen.getByText("8m 24s")).toBeInTheDocument();
    expect(screen.getByText("Inactive (30+ days)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Space Runner/ })).toHaveAttribute("href", "/game/space-runner");
    expect(screen.getByText("48.2%")).toBeInTheDocument();
    expect(screen.getByTitle("Wed 14:00 UTC: 9 users")).toBeInTheDocument();
    expect(screen.getByText("Organic Search")).toBeInTheDocument();
  });

  it("shows empty states instead of zero-filled charts", async () => {
    getMonitoringUsers.mockResolvedValue({
      data: {
        ...users,
        activity: [{ bucket: "2026-10-11T00:00:00Z", activeUsers: 0, newUsers: 0, returningUsers: 0 }],
        cohorts: [{ weekStart: "2026-10-05T00:00:00Z", users: 0, retention: [null, ...emptyWeeks] }],
        retention: [{ day: "2026-10-11T00:00:00Z", d1: null, d7: null, d30: null }],
        distribution: { new: 0, returning: 0, lapsed: 0, inactive: 0 },
        topGames: [],
        heatmap: [],
        acquisition: [],
      },
    });
    useAuthStore.setState({ accessToken: "token", user: { roles: ["SuperAdmin"] } as never });
    renderView();

    expect(await screen.findByText("No new users in the last 8 weeks.")).toBeInTheDocument();
    expect(screen.getByText(/Not enough new users yet/)).toBeInTheDocument();
    expect(screen.getByText("No users have been seen yet.")).toBeInTheDocument();
    expect(screen.getAllByText("No user activity in this range.")).toHaveLength(2);
    expect(screen.getByText("No new users in this range.")).toBeInTheDocument();
  });
});
