import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { ApiClientError } from "@/lib/api/types";

const loginMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    message: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("callbackUrl=/my-games"),
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    login: loginMock,
    register: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
    accessToken: null,
    user: null,
  }),
}));

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders email and password fields", () => {
    const { container } = renderForm();
    const form = within(container);
    expect(form.getByLabelText("Email")).toBeInTheDocument();
    expect(form.getByLabelText("Password")).toBeInTheDocument();
    expect(form.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("shows validation errors for empty submit", async () => {
    const user = userEvent.setup();
    const { container } = renderForm();
    const form = within(container);

    await user.click(form.getByRole("button", { name: "Sign In" }));

    expect(await form.findByText("Email is required.")).toBeInTheDocument();
    expect(form.getByText("Password is required.")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    const { container } = renderForm();
    const form = within(container);

    const password = form.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");

    await user.click(form.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");

    await user.click(form.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("shows loading state while submitting", async () => {
    const user = userEvent.setup();
    let resolveLogin: (() => void) | undefined;
    loginMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLogin = resolve;
        }),
    );

    const { container } = renderForm();
    const form = within(container);
    await user.type(form.getByLabelText("Email"), "player@example.com");
    await user.type(form.getByLabelText("Password"), "password123");
    await user.click(form.getByRole("button", { name: "Sign In" }));

    expect(await form.findByText("Signing in...")).toBeInTheDocument();
    expect(form.getByRole("button", { name: /Signing in/i })).toBeDisabled();

    resolveLogin?.();
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalled();
    });
  });

  it("shows API failure message", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(
      new ApiClientError("Unauthorized", 401, {
        status: 401,
        title: "Unauthorized",
        detail: "Invalid credentials",
      }),
    );

    const { container } = renderForm();
    const form = within(container);
    await user.clear(form.getByLabelText("Email"));
    await user.clear(form.getByLabelText("Password"));
    await user.type(form.getByLabelText("Email"), "player@example.com");
    await user.type(form.getByLabelText("Password"), "bad-password");
    await user.click(form.getByRole("button", { name: "Sign In" }));

    expect(
      await form.findByText("Invalid email or password."),
    ).toBeInTheDocument();
  });
});
