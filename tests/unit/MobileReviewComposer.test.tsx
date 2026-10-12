import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { MobileReviewComposer } from "@/features/mobile-tabs/components/MobileReviewComposer";
import { renderWithIntl } from "./helpers/intl";

const upsertGameReview = vi.fn();

vi.mock("@/lib/api/community", () => ({
  upsertGameReview: (...args: unknown[]) => upsertGameReview(...args),
}));

vi.mock("@/lib/analytics/client", () => ({
  analytics: { track: vi.fn(), pageView: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderComposer(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderWithIntl(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  upsertGameReview.mockReset();
  useAuthStore.setState({ accessToken: null, user: null });
});

afterEach(() => {
  cleanup();
});

describe("MobileReviewComposer", () => {
  it("asks guests to sign in", () => {
    renderComposer(<MobileReviewComposer slug="asteroid-dodge" gameId="g-1" />);

    const link = screen.getByRole("link", { name: "Sign in to write a review." });
    expect(link).toHaveAttribute(
      "href",
      `/login?callbackUrl=${encodeURIComponent("/game/asteroid-dodge")}`,
    );
    expect(screen.queryByRole("button", { name: "Submit review" })).not.toBeInTheDocument();
  });

  it("posts a rating and review when signed in", async () => {
    upsertGameReview.mockResolvedValue({ data: { id: "r1" } });
    useAuthStore.setState({ accessToken: "token", user: null });
    renderComposer(<MobileReviewComposer slug="asteroid-dodge" gameId="g-1" />);

    fireEvent.click(screen.getByRole("radio", { name: "4 out of 5 stars" }));
    fireEvent.change(screen.getByPlaceholderText("What did you think about this game?"), {
      target: { value: "Fast and fun." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit review" }));

    await waitFor(() =>
      expect(upsertGameReview).toHaveBeenCalledWith("asteroid-dodge", 4, "Fast and fun."),
    );
  });
});
