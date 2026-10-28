import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonitoringSeoView } from "@/features/admin-monitoring/components/MonitoringSeoView";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { MonitoringSeo } from "@/lib/api/monitoring";

const getMonitoringSeo = vi.fn();
const getMonitoringTraffic = vi.fn();

vi.mock("@/lib/api/monitoring", () => ({
  getMonitoringSeo: (...args: unknown[]) => getMonitoringSeo(...args),
  getMonitoringTraffic: (...args: unknown[]) => getMonitoringTraffic(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

const indexCoverage = { reason: "Google does not offer the Page indexing report through its API." };

const connected: MonitoringSeo = {
  range: "30d",
  from: "2026-09-11T12:00:00Z",
  to: "2026-10-10T12:00:00Z",
  generatedAt: "2026-10-11T00:00:00Z",
  siteUrl: "https://www.gamediscoveries.com/",
  search: {
    clicks: { value: 1234, changePercent: 18.4 },
    impressions: { value: 45678, changePercent: -3 },
    ctr: { value: 2.7, changePercent: 5.6 },
    position: { value: 12.4, changePercent: -9.8 },
    trend: [
      { bucket: "2026-10-09T12:00:00Z", clicks: 40, impressions: 1500, ctr: 2.67, position: 12.1 },
      { bucket: "2026-10-10T12:00:00Z", clicks: 44, impressions: 1600, ctr: 2.75, position: 11.9 },
    ],
    rankings: [
      { bucket: "2026-10-09T12:00:00Z", top3: 2, top10: 5, top50: 9 },
      { bucket: "2026-10-10T12:00:00Z", top3: 3, top10: 4, top50: 8 },
    ],
    pages: [
      { key: "https://www.gamediscoveries.com/game/space-run", clicks: 120, impressions: 3400, ctr: 3.5, position: 5.2 },
    ],
    queries: [{ key: "space game", clicks: 80, impressions: 2100, ctr: 3.8, position: 4.1 }],
    countries: [
      { key: "ID", clicks: 500, impressions: 9000, ctr: 5.6, position: 8 },
      { key: "ZZZ", clicks: 3, impressions: 40, ctr: 7.5, position: 20 },
    ],
    devices: [
      { key: "mobile", clicks: 900, impressions: 30000, ctr: 3, position: 11 },
      { key: "desktop", clicks: 334, impressions: 15678, ctr: 2.1, position: 14 },
    ],
  },
  searchUnavailable: null,
  sitemaps: [
    {
      path: "https://www.gamediscoveries.com/sitemap.xml",
      lastSubmitted: "2026-10-01T00:00:00Z",
      lastDownloaded: "2026-10-10T00:00:00Z",
      isPending: false,
      isSitemapsIndex: true,
      submitted: 8421,
      errors: 0,
      warnings: 0,
    },
  ],
  sitemapsUnavailable: null,
  coreWebVitals: {
    firstDate: "2026-09-13",
    lastDate: "2026-10-10",
    metrics: [
      { metric: "lcp", p75: 1800, goodPercent: 82.1, rating: "good" },
      { metric: "inp", p75: 98, goodPercent: 90, rating: "good" },
      { metric: "cls", p75: 0.04, goodPercent: 95, rating: "good" },
    ],
  },
  coreWebVitalsUnavailable: null,
  issues: [
    {
      kind: "striking_distance",
      severity: "low",
      target: "puzzle games",
      detail: "Position 7.3 with 85 impressions. Close to the top 3.",
    },
  ],
  indexCoverage,
};

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MonitoringSeoView />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getMonitoringSeo.mockReset();
  getMonitoringTraffic.mockReset();
  useAuthStore.setState({ accessToken: "token", user: { roles: ["SuperAdmin"] } as never });
});

afterEach(() => {
  cleanup();
});

describe("MonitoringSeoView", () => {
  it("renders Search Console metrics, sitemaps, vitals, and first-party sources", async () => {
    getMonitoringSeo.mockResolvedValue({ data: connected });
    getMonitoringTraffic.mockResolvedValue({
      data: { sources: [{ key: "organic_search", sessions: 30 }, { key: "direct", sessions: 10 }] },
    });
    renderView();

    expect(await screen.findAllByText("1,234")).toHaveLength(2);
    expect(getMonitoringSeo).toHaveBeenCalledWith({ range: "30d" }, false);
    expect(screen.getByText("12.4")).toBeInTheDocument();
    expect(screen.getByText("/game/space-run")).toBeInTheDocument();
    expect(screen.getByText("space game")).toBeInTheDocument();
    expect(screen.getByText("Indonesia")).toBeInTheDocument();
    expect(screen.getByText("Unknown region")).toBeInTheDocument();
    expect(screen.getAllByText("8,421").length).toBeGreaterThan(0);
    expect(screen.getByText("1.8 s")).toBeInTheDocument();
    expect(screen.getByText("Organic share")).toBeInTheDocument();
    expect(screen.getAllByText("75.0%")).toHaveLength(2);
    expect(screen.getByText("puzzle games")).toBeInTheDocument();
    expect(screen.getByText(indexCoverage.reason)).toBeInTheDocument();
  });

  it("colors a lower average position as an improvement", async () => {
    getMonitoringSeo.mockResolvedValue({ data: connected });
    getMonitoringTraffic.mockResolvedValue({ data: { sources: [] } });
    renderView();

    const change = await screen.findByText("9.8%", { exact: false });
    expect(change.className).toContain("text-[#3dd68c]");
  });

  it("switches the performance chart metric", async () => {
    getMonitoringSeo.mockResolvedValue({ data: connected });
    getMonitoringTraffic.mockResolvedValue({ data: { sources: [] } });
    renderView();

    const position = await screen.findByRole("button", { name: "Position" });
    fireEvent.click(position);

    expect(position).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Average position per day (lower is better)")).toBeInTheDocument();
  });

  it("explains why Search Console data is missing instead of showing zeros", async () => {
    getMonitoringSeo.mockResolvedValue({
      data: {
        ...connected,
        search: null,
        searchUnavailable: { reason: "Search Console is not connected." },
        sitemaps: null,
        sitemapsUnavailable: { reason: "Search Console is not connected." },
        coreWebVitals: null,
        coreWebVitalsUnavailable: { reason: "Core Web Vitals need a Chrome UX Report API key." },
        issues: [],
      },
    });
    getMonitoringTraffic.mockRejectedValue(new Error("down"));
    renderView();

    expect(await screen.findByText("Google Search performance")).toBeInTheDocument();
    expect(screen.getAllByText("Search Console is not connected.")).toHaveLength(2);
    expect(screen.getByText("Core Web Vitals need a Chrome UX Report API key.")).toBeInTheDocument();
    expect(screen.getByText("Traffic sources could not be loaded.")).toBeInTheDocument();
    expect(screen.queryByText("Organic Clicks")).not.toBeInTheDocument();
  });
});
