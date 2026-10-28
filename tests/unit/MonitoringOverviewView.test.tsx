import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonitoringOverviewView } from "@/features/admin-monitoring/components/MonitoringOverviewView";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { MonitoringOverview } from "@/lib/api/monitoring";

const getMonitoringOverview = vi.fn();
const getMonitoringTraffic = vi.fn();

vi.mock("@/lib/api/monitoring", () => ({
  getMonitoringOverview: (...args: unknown[]) => getMonitoringOverview(...args),
  getMonitoringTraffic: (...args: unknown[]) => getMonitoringTraffic(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

const point = (bucket: string, plays: number) => ({
  bucket,
  plays,
  activeUsers: 2,
  newUsers: 1,
  dau: 2,
  wau: 3,
  mau: 4,
});

const overview: MonitoringOverview = {
  range: "30d",
  from: "2026-09-11T00:00:00Z",
  to: "2026-10-11T00:00:00Z",
  generatedAt: "2026-10-11T00:00:00Z",
  activeUsers: { value: 12, changePercent: 12.4 },
  gamePlays: { value: 340, changePercent: -3 },
  newUsers: { value: 5, changePercent: null },
  apiSuccessRate: { reason: "Request success rate is not stored." },
  averageResponseTime: { reason: "Response time is not stored." },
  estimatedAdRevenue: { reason: "Ad revenue is not collected." },
  activity: [point("2026-10-10T00:00:00Z", 10), point("2026-10-11T00:00:00Z", 30)],
  topGames: [{ title: "Space Runner", thumbnailUrl: null, plays: 28, changePercent: 12 }],
  health: [
    { name: "API", status: "healthy", detail: null, latencyMs: 4.2 },
    { name: "Website", status: "unavailable", detail: "No uptime probe is configured.", latencyMs: null },
  ],
  providers: [{ name: "GameMonetize", source: "GameMonetize", status: "succeeded", lastSyncedAt: null }],
  recentErrors: { reason: "Application error logs are not stored." },
  recentIncidents: { reason: "Incident tracking is not configured." },
};

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MonitoringOverviewView />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getMonitoringOverview.mockReset();
  getMonitoringTraffic.mockReset();
  useAuthStore.setState({ accessToken: "token", user: { roles: ["SuperAdmin"] } as never });
});

afterEach(() => {
  cleanup();
});

describe("MonitoringOverviewView", () => {
  it("lays out the mockup panels with real values and unavailable metrics", async () => {
    getMonitoringOverview.mockResolvedValue({ data: overview });
    getMonitoringTraffic.mockResolvedValue({
      data: {
        sources: [{ key: "direct", sessions: 0 }],
        devices: [],
        browsers: [],
      },
    });
    renderView();

    expect(await screen.findByText("Space Runner")).toBeInTheDocument();
    expect(screen.getByText("▲ 12.4%")).toBeInTheDocument();
    expect(screen.getByText("▼ 3.0%")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Daily, weekly, and monthly active players" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Game plays over time" })).toBeInTheDocument();
    expect(screen.getByText("4 ms")).toBeInTheDocument();
    expect(screen.getByText("Application error logs are not stored.")).toBeInTheDocument();
    expect(screen.getByText("Incident tracking is not configured.")).toBeInTheDocument();
    expect(await screen.findAllByText("No visits in this range.")).toHaveLength(2);
  });
});
