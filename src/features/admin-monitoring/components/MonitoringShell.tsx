"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  Gamepad2,
  LogOut,
  Search,
  ShieldCheck,
  Target,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { adminPortalNav, monitoringNav } from "@/features/admin-monitoring/monitoringNav";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";

const portalIcons: Record<(typeof adminPortalNav)[number]["icon"], LucideIcon> = {
  users: Users,
  shield: ShieldCheck,
  trophy: Trophy,
  target: Target,
  award: Award,
  chart: BarChart3,
  search: Search,
};

const roleLabels: Record<string, string> = {
  SuperAdmin: "Super Admin",
  Admin: "Administrator",
  Moderator: "Moderator",
};

type AdminSection = "monitoring" | "users";

const sectionAccess: Record<AdminSection, { roles: string[]; denied: string }> = {
  monitoring: { roles: ["SuperAdmin"], denied: "Super admin access is required to view monitoring." },
  users: { roles: ["Moderator", "Admin", "SuperAdmin"], denied: "Moderator or admin access is required to manage users." },
};

function isPortalItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MonitoringShell({ children }: { children: ReactNode }) {
  return <AdminShell section="monitoring">{children}</AdminShell>;
}

export function AdminShell({ section, children }: { section: AdminSection; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { accessToken, user, logout } = useAuth();
  const roles = user?.roles ?? [];
  const access = sectionAccess[section];
  const allowed = roles.some((role) => access.roles.includes(role));
  const inMonitoring = section === "monitoring";
  const current = inMonitoring
    ? monitoringNav.find((item) => item.href === pathname)?.label ?? "Monitoring"
    : adminPortalNav.find((item) => isPortalItemActive(pathname, item.href))?.label ?? "Admin";

  let body: ReactNode = children;
  if (!accessToken) {
    body = (
      <p className="text-sm text-[#c7c8d6]">
        <Link href={`/login?callbackUrl=${pathname}`} className="font-semibold text-[#f5c542]">
          Sign in
        </Link>{" "}
        with an admin account.
      </p>
    );
  } else if (!user) {
    body = <p className="text-sm text-[#8b8ca3]">Loading account…</p>;
  } else if (!allowed) {
    body = (
      <p className="text-sm text-[#c7c8d6]" role="alert">
        {access.denied}
      </p>
    );
  }

  const adminName = user?.displayName || user?.username || user?.email || "Admin";
  const topRole = ["SuperAdmin", "Admin", "Moderator"].find((role) => roles.includes(role));
  const roleLabel = topRole ? roleLabels[topRole] : "Admin";

  return (
    <div lang="en" className="min-h-screen bg-[#07080f] text-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col border-b border-[#f5c542]/15 bg-[#0b0d14] px-3 py-4 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <Link href="/admin/monitoring" className="flex items-center gap-3 px-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5c542] text-[#1a1205]">
              <Gamepad2 className="h-6 w-6" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-black">GameDiscoveries</span>
              <span className="block text-[11px] text-[#8b8ca3]">Admin Portal</span>
            </span>
          </Link>

          <nav className="mt-6 flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin">
            {adminPortalNav.map((item) => {
              const Icon = portalIcons[item.icon];
              const active = isPortalItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#c7c8d6] hover:bg-white/5",
                    active && "bg-[#f5c542] font-bold text-[#1a1205] hover:bg-[#f5c542]",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-2">
            <Link
              href="/admin/monitoring"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                inMonitoring
                  ? "bg-[#f5c542] font-bold text-[#1a1205]"
                  : "border border-[#f5c542]/40 text-[#c7c8d6] hover:bg-white/5",
              )}
            >
              <Activity className="h-4 w-4" aria-hidden />
              <span className="flex-1">Monitoring</span>
              <ChevronDown className="hidden h-4 w-4 lg:block" aria-hidden />
            </Link>
            <nav
              className="mt-1 flex gap-1 overflow-x-auto lg:ml-3 lg:flex-col lg:border-l lg:border-[#f5c542]/20 lg:pl-2"
              aria-label="Monitoring"
            >
              {monitoringNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-[#c7c8d6] hover:bg-white/5",
                      active && "border border-[#f5c542]/60 bg-[#f5c542]/10 font-semibold text-[#f5c542]",
                    )}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-[#f5c542]" : "bg-[#8b8ca3]/50")}
                      aria-hidden
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {user ? (
            <div className="mt-6 hidden items-center gap-3 rounded-xl border border-white/10 bg-[#12141c] p-3 lg:mt-auto lg:flex">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f5c542]/20 text-xs font-bold text-[#f5c542]">
                  {initials(adminName)}
                </span>
              )}
              <span className="min-w-0 flex-1 text-xs">
                <span className="block truncate font-semibold">{adminName}</span>
                <span className="block text-[#8b8ca3]">{roleLabel}</span>
              </span>
              <button
                type="button"
                aria-label="Sign out"
                title="Sign out"
                className="rounded-md p-1.5 text-[#c7c8d6] hover:bg-white/5 hover:text-white"
                onClick={() => {
                  void logout().then(() => router.push("/"));
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : null}
        </aside>

        <div className="min-w-0">
          <header className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3 text-xs text-[#c7c8d6]">
              <Link
                href="/"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#f5c542]/30 px-3 py-1.5 font-semibold text-[#f5c542] hover:bg-[#f5c542]/10 focus-visible:outline-2 focus-visible:outline-[#f5c542]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to site
              </Link>
              <nav aria-label="Breadcrumb" className="flex items-center gap-1">
                {inMonitoring ? (
                  <Link href="/admin/monitoring" className="hover:text-white">
                    Monitoring
                  </Link>
                ) : (
                  <span>Admin</span>
                )}
                <ChevronRight className="h-3 w-3 text-[#8b8ca3]" aria-hidden />
                <span className="text-white">{current}</span>
              </nav>
            </div>
            {user ? (
              <div className="flex items-center gap-4">
                {roles.includes("SuperAdmin") ? (
                  <Link
                    href="/admin/monitoring/alerts"
                    aria-label="Alerts & Incidents"
                    className="rounded-md p-1 text-[#c7c8d6] hover:bg-white/5"
                  >
                    <Bell className="h-5 w-5" aria-hidden />
                  </Link>
                ) : null}
                <div className="flex items-center gap-2">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f5c542]/20 text-xs font-bold text-[#f5c542]">
                      {adminName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden text-xs sm:block">
                    <span className="block max-w-40 truncate font-semibold">{adminName}</span>
                    <span className="block text-[#8b8ca3]">{roleLabel}</span>
                  </span>
                </div>
              </div>
            ) : null}
          </header>
          <main className="px-4 py-6 sm:px-6">{body}</main>
        </div>
      </div>
    </div>
  );
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}
