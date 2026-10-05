"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function AdminCompetitionsPage() {
  const { accessToken, user } = useAuth();
  const roles = user?.roles ?? [];
  const canView = roles.some((r) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(r),
  );

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

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-bold text-white">Competitions</h1>
        <p className="text-sm text-muted-foreground">
          Settlement foundation for Phase 12 rewards. Default weekly/monthly boards
          auto-enroll via XP — no join required.
        </p>
      </header>
      <section className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
        <p>
          Use{" "}
          <code className="text-white">POST /api/v1/admin/competitions/{"{code}"}/settle</code>{" "}
          (SuperAdmin) with a reason to finalize rewards idempotently via{" "}
          <code className="text-white">COMPETITION_REWARD</code> XP (excluded from the same
          board score).
        </p>
        <p className="mt-3">
          <Link href="/admin/gamification/leaderboards" className="text-primary">
            ← Leaderboards
          </Link>
        </p>
      </section>
    </div>
  );
}
