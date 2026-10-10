import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MobileLogin, MobileSignup } from "@/features/auth/components/MobileAuth";
import { ApiClientError } from "@/lib/api/types";

const loginMock = vi.fn();
const registerMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("callbackUrl=/my-games"),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    login: loginMock,
    register: registerMock,
    logout: vi.fn(),
    isAuthenticated: false,
    accessToken: null,
    user: null,
  }),
}));

describe("MobileLogin", () => {
  beforeEach(() => {
    loginMock.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it("validates empty submit without calling the API", async () => {
    const user = userEvent.setup();
    render(<MobileLogin />);

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("signs in with the callback url and shows API failures", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(new ApiClientError("Unauthorized", 401));
    render(<MobileLogin />);

    await user.type(screen.getByLabelText("Email"), "player@example.com");
    await user.type(screen.getByLabelText("Password"), "bad-password");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() =>
      expect(loginMock).toHaveBeenCalledWith(
        { email: "player@example.com", password: "bad-password" },
        "/my-games",
      ),
    );
    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
  });

  it("keeps the callback url when switching to sign up", () => {
    render(<MobileLogin />);
    expect(
      screen.getByRole("link", { name: /Create one/ }),
    ).toHaveAttribute("href", "/signup?callbackUrl=%2Fmy-games");
  });
});

describe("MobileSignup", () => {
  beforeEach(() => {
    registerMock.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it("maps duplicate email errors", async () => {
    const user = userEvent.setup();
    registerMock.mockRejectedValue(new ApiClientError("Conflict", 409));
    render(<MobileSignup />);

    await user.type(screen.getByLabelText("Display name"), "Player One");
    await user.type(screen.getByLabelText("Email"), "player@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(
      await screen.findByText("An account with this email already exists."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign in/ })).toHaveAttribute(
      "href",
      "/login?callbackUrl=%2Fmy-games",
    );
  });
});
