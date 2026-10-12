import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminShell } from "@/features/admin-monitoring/components/MonitoringShell";
import { relativeTime, shortUserId } from "@/features/admin-users/adminUsersFormat";
import { AdminUsersView } from "@/features/admin-users/components/AdminUsersView";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { adminUsersQueryString, type AdminUsersPage, type AdminUsersStats } from "@/lib/api/adminUsers";

const listAdminUserDirectory = vi.fn();
const getAdminUsersStats = vi.fn();

vi.mock("@/lib/api/adminUsers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/adminUsers")>()),
  listAdminUserDirectory: (...args: unknown[]) => listAdminUserDirectory(...args),
  getAdminUsersStats: () => getAdminUsersStats(),
  exportAdminUsersCsv: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/users",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

const stats: AdminUsersStats = {
  totalUsers: { value: 18, changePercent: 12.5, trend: [16, 17, 18] },
  activeToday: { value: 2, changePercent: -20, trend: [3, 2, 2] },
  newThisMonth: { value: 7, changePercent: null, trend: [1, 0, 2] },
  suspended: 1,
  suspendedPercent: 5.6,
  generatedAt: "2026-10-12T15:00:00Z",
};

const page: AdminUsersPage = {
  items: [
    {
      id: "0f8fad5b-d9cb-469f-a165-70867728950e",
      email: "rudi@example.com",
      displayName: "Rudi Gunawan",
      username: "rudi",
      avatarUrl: null,
      role: "SuperAdmin",
      status: "active",
      lastActiveAt: "2026-10-12T14:58:00Z",
      createdAt: "2026-10-05T07:43:26Z",
      gamesPlayed: 13,
      level: 6,
      totalXp: 1275,
    },
    {
      id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      email: "sarah@example.com",
      displayName: "Sarah Chen",
      username: null,
      avatarUrl: null,
      role: "Player",
      status: "suspended",
      lastActiveAt: null,
      createdAt: "2026-10-03T07:03:50Z",
      gamesPlayed: 0,
      level: 1,
      totalXp: 0,
    },
  ],
  page: 1,
  pageSize: 10,
  total: 18,
};

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AdminShell section="users">
        <AdminUsersView />
      </AdminShell>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  listAdminUserDirectory.mockReset();
  getAdminUsersStats.mockReset();
  useAuthStore.setState({ accessToken: null, user: null });
});

afterEach(() => {
  cleanup();
});

describe("AdminUsersView", () => {
  it("blocks accounts without a moderator or admin role", () => {
    useAuthStore.setState({ accessToken: "token", user: { roles: ["Player"] } as never });
    renderView();

    expect(screen.getByRole("alert")).toHaveTextContent("Moderator or admin access is required");
    expect(listAdminUserDirectory).not.toHaveBeenCalled();
  });

  it("renders stats and the user directory from the API", async () => {
    getAdminUsersStats.mockResolvedValue({ data: stats });
    listAdminUserDirectory.mockResolvedValue({ data: page });
    useAuthStore.setState({ accessToken: "token", user: { id: "admin", roles: ["SuperAdmin"] } as never });
    renderView();

    expect(await screen.findByText("Rudi Gunawan")).toBeInTheDocument();
    expect(listAdminUserDirectory).toHaveBeenCalledWith({ sort: "lastActive", dir: "desc" }, 1, 10);
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Super Admin", { selector: "span.rounded-full" })).toBeInTheDocument();
    expect(screen.getByText("Suspended", { selector: "span.rounded-full" })).toBeInTheDocument();
    expect(screen.getByText("Never")).toBeInTheDocument();
    expect(screen.getByText("ID: #0F8FAD5B")).toBeInTheDocument();
    expect(screen.getByText("Showing 1–10 of 18 users")).toBeInTheDocument();
    expect(await screen.findByText("5.6% of total users")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export CSV/ })).toBeInTheDocument();
  });

  it("applies filters and sorting through the API query", async () => {
    getAdminUsersStats.mockResolvedValue({ data: stats });
    listAdminUserDirectory.mockResolvedValue({ data: page });
    useAuthStore.setState({ accessToken: "token", user: { id: "admin", roles: ["Moderator"] } as never });
    renderView();
    await screen.findByText("Rudi Gunawan");

    const form = screen.getByRole("form", { name: "Filter users" });
    fireEvent.change(within(form).getByPlaceholderText(/Search by name/), { target: { value: " rudi " } });
    fireEvent.change(within(form).getByLabelText("Status"), { target: { value: "suspended" } });
    fireEvent.click(within(form).getByRole("button", { name: "Filter" }));

    await waitFor(() =>
      expect(listAdminUserDirectory).toHaveBeenLastCalledWith(
        { search: "rudi", status: "suspended", role: undefined, joined: undefined, sort: "lastActive", dir: "desc" },
        1,
        10,
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: /Games Played/ }));
    await waitFor(() =>
      expect(listAdminUserDirectory).toHaveBeenLastCalledWith(expect.objectContaining({ sort: "games", dir: "desc" }), 1, 10),
    );
    expect(screen.queryByRole("button", { name: /Export CSV/ })).not.toBeInTheDocument();
  });
});

describe("admin users helpers", () => {
  it("builds the query string from set filters only", () => {
    expect(adminUsersQueryString({ search: "  ", role: "Moderator", sort: "joined", dir: "asc" }, 2, 10)).toBe(
      "?role=Moderator&sort=joined&dir=asc&page=2&pageSize=10",
    );
    expect(adminUsersQueryString({})).toBe("");
  });

  it("formats relative times and short ids", () => {
    const now = Date.parse("2026-10-12T15:00:00Z");
    expect(relativeTime("2026-10-12T14:58:00Z", now)).toBe("2 minutes ago");
    expect(relativeTime("2026-10-12T14:59:30Z", now)).toBe("just now");
    expect(relativeTime("2026-10-11T15:00:00Z", now)).toBe("yesterday");
    expect(relativeTime(null, now)).toBeNull();
    expect(shortUserId("0f8fad5b-d9cb-469f-a165-70867728950e")).toBe("0F8FAD5B");
  });
});
