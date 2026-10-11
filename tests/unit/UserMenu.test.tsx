import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserMenu } from "@/components/navigation/UserMenu";
import messages from "../../messages/id.json";

const push = vi.fn();
let roles: string[] = [];

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true, logout: vi.fn(), user: { roles } }),
}));

vi.mock("@/features/auth/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: { displayName: "Super Admin", email: "admin@example.com" } }),
}));

function openMenu() {
  render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <UserMenu />
    </NextIntlClientProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: messages.Nav.openUserMenu }));
}

afterEach(() => {
  cleanup();
  push.mockReset();
});

describe("UserMenu", () => {
  it("links super admins to the admin portal", async () => {
    roles = ["SuperAdmin"];
    openMenu();

    fireEvent.click(await screen.findByRole("menuitem", { name: "Portal Admin" }));
    expect(push).toHaveBeenCalledWith("/admin/monitoring");
  });

  it("hides the admin portal from other users", async () => {
    roles = ["User"];
    openMenu();

    expect(await screen.findByRole("menuitem", { name: "Baru Dimainkan" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Portal Admin" })).not.toBeInTheDocument();
  });
});
