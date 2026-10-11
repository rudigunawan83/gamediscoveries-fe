import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonitoringTrafficView } from "@/features/admin-monitoring/components/MonitoringTrafficView";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { MonitoringTraffic } from "@/lib/api/monitoring";

const getMonitoringTraffic = vi.fn();

vi.mock("@/lib/api/monitoring", () => ({
  getMonitoringTraffic: (...args: unknown[]) => getMonitoringTraffic(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

const traffic: MonitoringTraffic = {
  range: "30d",
  from: "2026-09-11T00:00:00Z",
  to: "2026-10-11T00:00:00Z",
  generatedAt: "2026-10-11T00:00:00Z",
  visits: { value: 40, changePercent: 25 },
  pageViews: { value: 120, changePercent: null },
  uniqueVisitors: { value: 30, changePercent: -10 },
  averageSessionDuration: { seconds: 185, changePercent: null },
  newVsReturning: { newVisitors: 3, returningVisitors: 1 },
  trend: [
    { bucket: "2026-10-10T00:00:00Z", visitors: 10, pageViews: 30 },
    { bucket: "2026-10-11T00:00:00Z", visitors: 20, pageViews: 90 },
  ],
  sources: [
    { key: "organic_search", sessions: 30 },
    { key: "direct", sessions: 10 },
    { key: "social", sessions: 0 },
    { key: "referral", sessions: 0 },
    { key: "paid_ads", sessions: 0 },
    { key: "others", sessions: 0 },
  ],
  countries: { reason: "Country is not collected." },
  devices: [{ key: "mobile", sessions: 40 }],
  browsers: [{ key: "Chrome", sessions: 40 }],
  landingPages: [{ path: "/game/space-run", count: 12, changePercent: 50 }],
  exitPages: [{ path: "/search", exits: 5, exitRate: 41.7 }],
  searchKeywords: [],
  platforms: [
    { key: "web", sessions: 32 },
    { key: "android", sessions: 8 },
  ],
};

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MonitoringTrafficView />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getMonitoringTraffic.mockReset();
  useAuthStore.setState({ accessToken: null, user: null });
});

afterEach(() => {
  cleanup();
});

describe("MonitoringTrafficView", () => {
  it("blocks users without the super admin role", () => {
    useAuthStore.setState({ accessToken: "token", user: { roles: ["User"] } as never });
    renderView();

    expect(screen.getByRole("alert")).toHaveTextContent("Super admin access is required");
    expect(getMonitoringTraffic).not.toHaveBeenCalled();
  });

  it("renders real traffic and keeps country unavailable", async () => {
    getMonitoringTraffic.mockResolvedValue({ data: traffic });
    useAuthStore.setState({ accessToken: "token", user: { roles: ["SuperAdmin"] } as never });
    renderView();

    expect(await screen.findByText("3m 5s")).toBeInTheDocument();
    expect(getMonitoringTraffic).toHaveBeenCalledWith("30d", false);
    expect(screen.getByText("Country is not collected.")).toBeInTheDocument();
    expect(screen.getByText("Organic Search")).toBeInTheDocument();
    expect(screen.getAllByText("75.0%")).toHaveLength(2);
    expect(screen.getByText("/game/space-run")).toBeInTheDocument();
    expect(screen.getByText("41.7%")).toBeInTheDocument();
    expect(screen.getByText("No searches in this range.")).toBeInTheDocument();
  });

  it("splits visits between the website and the mobile app", async () => {
    getMonitoringTraffic.mockResolvedValue({ data: traffic });
    useAuthStore.setState({ accessToken: "token", user: { roles: ["SuperAdmin"] } as never });
    renderView();

    expect(await screen.findByText("Visitors by Platform")).toBeInTheDocument();
    expect(screen.getByText("Website")).toBeInTheDocument();
    expect(screen.getByText("Android App")).toBeInTheDocument();
    expect(screen.getByText("80.0%")).toBeInTheDocument();
    expect(screen.queryByText(/Website only/)).not.toBeInTheDocument();
  });
});
