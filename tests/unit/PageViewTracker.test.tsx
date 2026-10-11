import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PageViewTracker,
  resetPageViewTrackerForTests,
} from "@/features/seo/components/PageViewTracker";
import { analytics } from "@/lib/analytics/client";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("@/lib/analytics/client", () => ({
  analytics: { track: vi.fn(), pageView: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

describe("PageViewTracker", () => {
  beforeEach(() => {
    vi.mocked(analytics.pageView).mockClear();
    resetPageViewTrackerForTests();
    navigation.pathname = "/";
  });

  it("tracks each route change once", () => {
    const { rerender } = render(<PageViewTracker />);
    rerender(<PageViewTracker />);

    navigation.pathname = "/game/space-run";
    rerender(<PageViewTracker />);

    expect(analytics.pageView).toHaveBeenCalledTimes(2);
    expect(analytics.pageView).toHaveBeenNthCalledWith(1, "/");
    expect(analytics.pageView).toHaveBeenNthCalledWith(2, "/game/space-run");
  });
});
