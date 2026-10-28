import type { ReactNode } from "react";
import Link from "next/link";
import { createMetadata } from "@/lib/seo/metadata";
import { AdminShell } from "@/features/admin-monitoring/components/MonitoringShell";

export function generateMetadata() {
  return createMetadata({
    title: "Gamification Admin",
    path: "/admin/gamification",
    noIndex: true,
  });
}

/** Extra tools that are not top-level sidebar items. */
const tools = [
  { href: "/admin/gamification", label: "Overview" },
  { href: "/admin/gamification/levels", label: "Levels" },
  { href: "/admin/gamification/streaks", label: "Streaks" },
  { href: "/admin/gamification/discovery", label: "Discovery" },
  { href: "/admin/gamification/recommendations", label: "Recommendations" },
  { href: "/admin/gamification/competitions", label: "Competitions" },
  { href: "/admin/gamification/audit-logs", label: "Audit Logs" },
] as const;

export default function AdminGamificationLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell section="portal">
      <div className="space-y-6">
        <nav className="flex flex-wrap gap-2 text-sm" aria-label="Gamification tools">
          {tools.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[#c7c8d6] hover:border-[#f5c542]/40 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </AdminShell>
  );
}
