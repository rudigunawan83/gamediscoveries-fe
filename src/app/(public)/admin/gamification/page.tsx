"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getGamificationOverview } from "@/lib/api/progress";

export default function AdminGamificationOverviewPage() {
  const { accessToken, user } = useAuth();
  const roles = user?.roles ?? [];
  const canView = roles.some((r) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(r),
  );

  const overviewQuery = useQuery({
    queryKey: ["admin", "gamification", "overview"],
    queryFn: async () => (await getGamificationOverview()).data!,
    enabled: Boolean(accessToken && canView),
  });

  if (!accessToken) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary">
          Sign in
        </Link>{" "}
        as admin.
      </p>
    );
  }

  if (!canView) {
    return (
      <p className="text-sm text-muted-foreground">
        Moderator or admin role required.
      </p>
    );
  }

  const data = overviewQuery.data;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-white">
          Gamification Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          XP and level health across the platform.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Users", data?.totalUsers],
          ["Users with XP", data?.usersWithXp],
          ["Total XP awarded", data?.totalXpAwarded],
          ["XP today", data?.xpToday],
          ["XP this week", data?.xpThisWeek],
          ["Average level", data?.averageLevel],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">
              {value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            XP by rule
          </h2>
          <ul className="mt-3 space-y-2">
            {(data?.xpByRule ?? []).map((row) => (
              <li
                key={row.name}
                className="flex justify-between text-sm text-muted-foreground"
              >
                <span>{row.name}</span>
                <span className="text-white">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            Level distribution
          </h2>
          <ul className="mt-3 space-y-2">
            {(data?.levelDistribution ?? []).slice(0, 15).map((row) => (
              <li
                key={row.name}
                className="flex justify-between text-sm text-muted-foreground"
              >
                <span>Level {row.name}</span>
                <span className="text-white">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
