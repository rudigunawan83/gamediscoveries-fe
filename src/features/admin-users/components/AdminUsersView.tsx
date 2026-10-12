"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  CircleDot,
  Download,
  Filter,
  MoreVertical,
  RotateCcw,
  Search,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Sparkline } from "@/features/admin-monitoring/components/MonitoringCharts";
import { Change } from "@/features/admin-monitoring/components/MonitoringUi";
import { initials } from "@/features/admin-monitoring/components/MonitoringShell";
import {
  formatJoinedDate,
  isRecentlyActive,
  relativeTime,
  roleBadgeClass,
  roleLabel,
  shortUserId,
  statusBadge,
} from "@/features/admin-users/adminUsersFormat";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  ADMIN_USER_JOINED,
  ADMIN_USER_ROLES,
  ADMIN_USER_STATUSES,
  exportAdminUsersCsv,
  getAdminUsersStats,
  listAdminUserDirectory,
  type AdminUserJoined,
  type AdminUserRole,
  type AdminUserRow,
  type AdminUserSort,
  type AdminUsersFilters,
  type AdminUsersStat,
  type AdminUserStatus,
} from "@/lib/api/adminUsers";
import { suspendUser, unsuspendUser } from "@/lib/api/progress";
import { pageWindow } from "@/lib/seo/pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const joinedLabels: Record<AdminUserJoined, string> = {
  "24h": "Joined last 24 hours",
  "7d": "Joined last 7 days",
  "30d": "Joined last 30 days",
  "90d": "Joined last 90 days",
  "365d": "Joined last year",
};

type Draft = { search: string; status: "" | AdminUserStatus; role: "" | AdminUserRole; joined: "" | AdminUserJoined };
const emptyDraft: Draft = { search: "", status: "", role: "", joined: "" };

function toFilters(draft: Draft): AdminUsersFilters {
  return {
    search: draft.search.trim() || undefined,
    status: draft.status || undefined,
    role: draft.role || undefined,
    joined: draft.joined || undefined,
  };
}

const selectClass =
  "h-10 rounded-lg border border-white/10 bg-[#12141c] px-3 text-sm text-[#c7c8d6] focus-visible:outline-2 focus-visible:outline-[#f5c542]";

export function AdminUsersView() {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const canExport = roles.includes("Admin") || roles.includes("SuperAdmin");
  const canSuspend = roles.includes("SuperAdmin");

  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [filters, setFilters] = useState<AdminUsersFilters>({});
  const [sort, setSort] = useState<{ sort: AdminUserSort; dir: "asc" | "desc" }>({ sort: "lastActive", dir: "desc" });
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const queryClient = useQueryClient();

  const stats = useQuery({
    queryKey: ["admin", "users", "stats"],
    queryFn: async () => (await getAdminUsersStats()).data!,
    staleTime: 60_000,
  });

  const directory = useQuery({
    queryKey: ["admin", "users", "directory", filters, sort, page],
    queryFn: async () => (await listAdminUserDirectory({ ...filters, ...sort }, page, PAGE_SIZE)).data!,
    placeholderData: keepPreviousData,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ row, suspend, reason }: { row: AdminUserRow; suspend: boolean; reason: string }) =>
      suspend ? suspendUser(row.id, reason) : unsuspendUser(row.id, reason),
    onSuccess: (_, { row, suspend }) => {
      setNotice({ tone: "ok", text: `${row.displayName} ${suspend ? "suspended" : "reactivated"}.` });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: () => setNotice({ tone: "error", text: "The status change failed. Try again." }),
  });

  const apply = (event?: FormEvent) => {
    event?.preventDefault();
    setFilters(toFilters(draft));
    setPage(1);
  };

  const reset = () => {
    setDraft(emptyDraft);
    setFilters({});
    setSort({ sort: "lastActive", dir: "desc" });
    setPage(1);
  };

  const toggleSort = (column: AdminUserSort) => {
    setSort((current) =>
      current.sort === column ? { sort: column, dir: current.dir === "desc" ? "asc" : "desc" } : { sort: column, dir: "desc" },
    );
    setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    setNotice(null);
    try {
      const csv = (await exportAdminUsersCsv({ ...filters, ...sort })).data ?? "";
      const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setNotice({ tone: "error", text: "Export failed. Try again." });
    } finally {
      setExporting(false);
    }
  };

  const data = directory.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const firstShown = data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const lastShown = data ? Math.min(data.total, data.page * data.pageSize) : 0;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#f5c542]/40 bg-[#f5c542]/10 text-[#f5c542]">
            <Users className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-black">Users</h1>
            <p className="text-sm text-[#8b8ca3]">Manage player accounts, roles, and activity.</p>
          </div>
        </div>
        {canExport ? (
          <button
            type="button"
            onClick={() => void exportCsv()}
            disabled={exporting}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#f5c542]/60 px-4 text-sm font-semibold text-[#f5c542] hover:bg-[#f5c542]/10 disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        ) : null}
      </header>

      <section aria-label="User statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          icon={Users}
          stat={stats.data?.totalUsers}
          hint="vs. 30 days ago"
          loading={stats.isPending}
        />
        <StatCard
          label="Active Today"
          icon={CircleDot}
          iconClass="border-[#3dd68c]/40 bg-[#3dd68c]/10 text-[#3dd68c]"
          stat={stats.data?.activeToday}
          hint="last 24h vs. 7-day average"
          color="#3dd68c"
          loading={stats.isPending}
        />
        <StatCard
          label="New This Month"
          icon={UserPlus}
          stat={stats.data?.newThisMonth}
          hint="vs. same days last month"
          loading={stats.isPending}
        />
        <article className="flex flex-col rounded-2xl border border-[#f5c542]/25 bg-[#12141c] p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]">
              <Ban className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs text-[#c7c8d6]">Suspended</p>
              <p className="text-2xl font-black tabular-nums">
                {stats.data ? stats.data.suspended.toLocaleString("en") : "—"}
              </p>
              <p className="text-[11px] text-[#8b8ca3]">
                {stats.data?.suspendedPercent != null ? `${stats.data.suspendedPercent}% of total users` : "No users yet"}
              </p>
            </div>
          </div>
        </article>
      </section>
      {stats.isError ? (
        <p role="alert" className="text-sm text-[#ff6b6b]">
          User statistics could not be loaded.
        </p>
      ) : null}

      <form
        onSubmit={apply}
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#0e1018] p-3"
        aria-label="Filter users"
      >
        <label className="relative min-w-56 flex-1">
          <span className="sr-only">Search users</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8ca3]" aria-hidden />
          <input
            value={draft.search}
            onChange={(event) => setDraft((d) => ({ ...d, search: event.target.value }))}
            placeholder="Search by name, email, or user ID…"
            className="h-10 w-full rounded-lg border border-white/10 bg-[#12141c] pl-9 pr-3 text-sm text-white placeholder:text-[#8b8ca3] focus-visible:outline-2 focus-visible:outline-[#f5c542]"
          />
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select
            value={draft.status}
            onChange={(event) => setDraft((d) => ({ ...d, status: event.target.value as Draft["status"] }))}
            className={selectClass}
          >
            <option value="">All Statuses</option>
            {ADMIN_USER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusBadge[status].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Role</span>
          <select
            value={draft.role}
            onChange={(event) => setDraft((d) => ({ ...d, role: event.target.value as Draft["role"] }))}
            className={selectClass}
          >
            <option value="">All Roles</option>
            {ADMIN_USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {roleLabel[role]}
              </option>
            ))}
          </select>
        </label>
        <label className="relative">
          <span className="sr-only">Joined</span>
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8ca3]" aria-hidden />
          <select
            value={draft.joined}
            onChange={(event) => setDraft((d) => ({ ...d, joined: event.target.value as Draft["joined"] }))}
            className={cn(selectClass, "pl-9")}
          >
            <option value="">Joined any time</option>
            {ADMIN_USER_JOINED.map((joined) => (
              <option key={joined} value={joined}>
                {joinedLabels[joined]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm text-[#c7c8d6] hover:bg-white/5"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset
        </button>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#f5c542] px-4 text-sm font-bold text-[#1a1205] hover:bg-[#f7d06a]"
        >
          <Filter className="h-4 w-4" aria-hidden />
          Filter
        </button>
      </form>

      {notice ? (
        <p role={notice.tone === "error" ? "alert" : "status"} className={cn("text-sm", notice.tone === "error" ? "text-[#ff6b6b]" : "text-[#3dd68c]")}>
          {notice.text}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0e1018]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wide text-[#8b8ca3]">
            <tr>
              <th scope="col" className="px-4 py-3">User</th>
              <th scope="col" className="px-4 py-3">Role</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <SortHeader label="Last Active" column="lastActive" sort={sort} onSort={toggleSort} />
              <SortHeader label="Joined" column="joined" sort={sort} onSort={toggleSort} />
              <SortHeader label="Games Played" column="games" sort={sort} onSort={toggleSort} />
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {directory.isPending ? (
              <TableMessage>Loading users…</TableMessage>
            ) : directory.isError ? (
              <TableMessage>
                <span role="alert">Users could not be loaded. </span>
                <button type="button" className="font-semibold text-[#f5c542]" onClick={() => directory.refetch()}>
                  Try again
                </button>
              </TableMessage>
            ) : data && data.items.length === 0 ? (
              <TableMessage>No users match these filters.</TableMessage>
            ) : (
              data?.items.map((row) => (
                <UserTableRow
                  key={row.id}
                  row={row}
                  canSuspend={canSuspend && row.id !== user?.id}
                  busy={statusMutation.isPending && statusMutation.variables?.row.id === row.id}
                  onStatus={(suspend) => {
                    const verb = suspend ? "Suspend" : "Reactivate";
                    if (!window.confirm(`${verb} ${row.displayName} (${row.email})?`)) return;
                    setNotice(null);
                    statusMutation.mutate({
                      row,
                      suspend,
                      reason: suspend ? "Suspended from the admin users page" : "Reactivated from the admin users page",
                    });
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > 0 ? (
        <nav aria-label="Users pagination" className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#8b8ca3]">
          <p>
            Showing {firstShown.toLocaleString("en")}–{lastShown.toLocaleString("en")} of {data.total.toLocaleString("en")} users
          </p>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </nav>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  icon: Icon,
  iconClass = "border-[#f5c542]/40 bg-[#f5c542]/10 text-[#f5c542]",
  stat,
  hint,
  color = "#f5c542",
  loading,
}: {
  label: string;
  icon: LucideIcon;
  iconClass?: string;
  stat: AdminUsersStat | undefined;
  hint: string;
  color?: string;
  loading: boolean;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-[#f5c542]/25 bg-[#12141c] p-4">
      <div className="flex items-start gap-3">
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl border", iconClass)}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[#c7c8d6]">{label}</p>
          <p className="text-2xl font-black tabular-nums">{stat ? stat.value.toLocaleString("en") : loading ? "…" : "—"}</p>
          <p className="flex items-center gap-1 text-[11px] text-[#8b8ca3]">
            {stat?.changePercent != null ? <Change value={stat.changePercent} /> : null}
            <span>{hint}</span>
          </p>
        </div>
        <div className="w-20 shrink-0 self-center">{stat ? <Sparkline values={stat.trend} color={color} /> : null}</div>
      </div>
    </article>
  );
}

function SortHeader({
  label,
  column,
  sort,
  onSort,
}: {
  label: string;
  column: AdminUserSort;
  sort: { sort: AdminUserSort; dir: "asc" | "desc" };
  onSort: (column: AdminUserSort) => void;
}) {
  const active = sort.sort === column;
  const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <th scope="col" className="px-4 py-3" aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn("inline-flex items-center gap-1 uppercase hover:text-white", active && "text-[#f5c542]")}
      >
        {label}
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </button>
    </th>
  );
}

function TableMessage({ children }: { children: ReactNode }) {
  return (
    <tr>
      <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#8b8ca3]">
        {children}
      </td>
    </tr>
  );
}

function UserTableRow({
  row,
  canSuspend,
  busy,
  onStatus,
}: {
  row: AdminUserRow;
  canSuspend: boolean;
  busy: boolean;
  onStatus: (suspend: boolean) => void;
}) {
  const status = statusBadge[row.status] ?? {
    label: row.status,
    className: "border-white/10 bg-white/5 text-[#c7c8d6]",
    dot: "bg-[#8b8ca3]",
  };
  const lastActive = relativeTime(row.lastActiveAt);

  return (
    <tr className="border-t border-white/5 hover:bg-white/[0.02]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {row.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f5c542]/15 text-xs font-bold text-[#f5c542]">
              {initials(row.displayName)}
            </span>
          )}
          <div className="min-w-0">
            <Link
              href={`/admin/gamification/users/${row.id}`}
              className="block truncate font-semibold text-white hover:text-[#f5c542]"
            >
              {row.displayName}
            </Link>
            <p className="truncate text-xs text-[#c7c8d6]">{row.email}</p>
            <p className="text-[11px] text-[#8b8ca3]" title={row.id}>
              ID: #{shortUserId(row.id)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            roleBadgeClass[row.role] ?? roleBadgeClass.Player,
          )}
        >
          {roleLabel[row.role] ?? row.role}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", status.className)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} aria-hidden />
          {status.label}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-[#c7c8d6]">
        {lastActive ? (
          <span className="inline-flex items-center gap-2" title={new Date(row.lastActiveAt!).toLocaleString("en")}>
            <span
              className={cn("h-2 w-2 rounded-full", isRecentlyActive(row.lastActiveAt) ? "bg-[#3dd68c]" : "bg-[#8b8ca3]/60")}
              aria-hidden
            />
            {lastActive}
          </span>
        ) : (
          <span className="text-[#8b8ca3]">Never</span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <p className="text-sm text-white">{formatJoinedDate(row.createdAt)}</p>
        <p className="text-[11px] text-[#8b8ca3]">{relativeTime(row.createdAt)}</p>
      </td>
      <td className="px-4 py-3 tabular-nums text-white">{row.gamesPlayed.toLocaleString("en")}</td>
      <td className="px-4 py-3 text-right">
        <RowActions row={row} canSuspend={canSuspend} busy={busy} onStatus={onStatus} />
      </td>
    </tr>
  );
}

function RowActions({
  row,
  canSuspend,
  busy,
  onStatus,
}: {
  row: AdminUserRow;
  canSuspend: boolean;
  busy: boolean;
  onStatus: (suspend: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const suspended = row.status === "suspended";

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Actions for ${row.displayName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
        className="rounded-md p-1.5 text-[#c7c8d6] hover:bg-white/5 hover:text-white disabled:opacity-50"
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-white/10 bg-[#12141c] py-1 text-sm shadow-xl"
        >
          <Link
            role="menuitem"
            href={`/admin/gamification/users/${row.id}`}
            className="block px-3 py-2 text-[#c7c8d6] hover:bg-white/5 hover:text-white"
          >
            View details
          </Link>
          {canSuspend ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onStatus(!suspended);
              }}
              className={cn(
                "block w-full px-3 py-2 text-left hover:bg-white/5",
                suspended ? "text-[#3dd68c]" : "text-[#ff6b6b]",
              )}
            >
              {suspended ? "Reactivate user" : "Suspend user"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  const pages = pageWindow(page, totalPages, 2);
  const buttonClass =
    "grid h-9 min-w-9 place-items-center rounded-lg border border-white/10 px-2 text-sm text-[#c7c8d6] hover:bg-white/5 disabled:opacity-40";
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className={buttonClass}>
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
      {pages.map((value, index) => (
        <span key={value} className="flex items-center gap-1.5">
          {index > 0 && value - pages[index - 1] > 1 ? <span aria-hidden>…</span> : null}
          <button
            type="button"
            aria-current={value === page ? "page" : undefined}
            onClick={() => onPage(value)}
            className={cn(buttonClass, value === page && "border-[#f5c542] bg-[#f5c542] font-bold text-[#1a1205] hover:bg-[#f5c542]")}
          >
            {value.toLocaleString("en")}
          </button>
        </span>
      ))}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className={buttonClass}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
