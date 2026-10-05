import type { ReactNode } from "react";
import Link from "next/link";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Gamification Admin",
  path: "/admin/gamification",
  noIndex: true,
});

const links = [
  { href: "/admin/gamification", label: "Overview" },
  { href: "/admin/gamification/users", label: "Users" },
  { href: "/admin/gamification/levels", label: "Levels" },
  { href: "/admin/gamification/missions", label: "Missions" },
  { href: "/admin/gamification/streaks", label: "Streaks" },
  { href: "/admin/gamification/achievements", label: "Achievements" },
  { href: "/admin/gamification/discovery", label: "Discovery" },
  { href: "/admin/gamification/recommendations", label: "Recommendations" },
  { href: "/admin/gamification/leaderboards", label: "Leaderboards" },
  { href: "/admin/gamification/competitions", label: "Competitions" },
  { href: "/admin/gamification/audit-logs", label: "Audit Logs" },
];

export default function AdminGamificationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <nav className="flex flex-wrap gap-3 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-muted-foreground hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
