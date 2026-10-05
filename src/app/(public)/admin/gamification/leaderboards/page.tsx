"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getAdminLeaderboards,
  rebuildLeaderboard,
} from "@/lib/api/leaderboards";

export default function AdminLeaderboardsPage() {
  const { accessToken, user } = useAuth();
  const roles = user?.roles ?? [];
  const canView = roles.some((r) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(r),
  );
  const qc = useQueryClient();
  const [reason, setReason] = useState("manual rebuild");

  const overviewQuery = useQuery({
    queryKey: ["admin", "leaderboards"],
    queryFn: async () => (await getAdminLeaderboards()).data ?? [],
    enabled: Boolean(accessToken && canView),
  });

  const rebuildMutation = useMutation({
    mutationFn: async (code: string) => rebuildLeaderboard(code, reason),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "leaderboards"] });
    },
  });

  if (!accessToken || !canView) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary">
          Sign in
        </Link>{" "}
        as admin to manage leaderboards.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-white">Leaderboards</h1>
        <p className="text-sm text-muted-foreground">
          XP competition boards · LEADERBOARD_V1 · Asia/Jakarta periods
        </p>
      </header>

      <label className="block text-sm text-muted-foreground">
        Rebuild reason
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
        />
      </label>

      <div className="space-y-3">
        {(overviewQuery.data ?? []).map((row) => (
          <div
            key={row.code}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl font-bold text-white">{row.name}</p>
                <p className="text-xs text-muted-foreground">
                  {row.code} · {row.periodCode ?? "no period"} · {row.periodStatus ?? "—"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Participants {row.participants} · Top {row.topScore.toLocaleString()} XP ·
                  Avg {Math.round(row.averageScore).toLocaleString()} XP
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white hover:bg-white/10"
                disabled={rebuildMutation.isPending}
                onClick={() => rebuildMutation.mutate(row.code)}
              >
                Rebuild
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Competitions:{" "}
        <Link href="/admin/gamification/competitions" className="text-primary">
          manage competitions
        </Link>
      </p>
    </div>
  );
}
