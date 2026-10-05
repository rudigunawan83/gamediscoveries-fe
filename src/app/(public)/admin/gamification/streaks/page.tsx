"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getAdminStreakOverview } from "@/lib/api/streaks";

export default function AdminStreaksPage() {
  const { accessToken, user } = useAuth();
  const canView = (user?.roles ?? []).some((r) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(r),
  );

  const query = useQuery({
    queryKey: ["admin", "streaks", "overview"],
    queryFn: async () => (await getAdminStreakOverview()).data!,
    enabled: Boolean(accessToken && canView),
  });

  if (!accessToken || !canView) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary">
          Sign in
        </Link>{" "}
        as admin.
      </p>
    );
  }

  const data = query.data;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-white">Streaks</h1>
        <p className="text-sm text-muted-foreground">
          Retention streak health across the platform.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Active streaks", data?.usersWithActiveStreak],
          ["Avg current", data?.averageCurrentStreak],
          ["Avg longest", data?.averageLongestStreak],
          ["7+ day users", data?.usersAt7Days],
          ["30+ day users", data?.usersAt30Days],
          ["1-day users", data?.usersAt1Day],
          ["Freezes used", data?.freezesConsumedTotal],
          ["Milestones", data?.milestonesReached],
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

      <p className="text-sm text-muted-foreground">
        Manage freezes and resets from{" "}
        <Link href="/admin/gamification/users" className="text-primary">
          user detail
        </Link>
        .
      </p>
    </div>
  );
}
