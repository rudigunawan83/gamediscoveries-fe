"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  adjustUserXp,
  getAdminUser,
  resetUserGamification,
  suspendUser,
  unsuspendUser,
  xpRuleLabel,
} from "@/lib/api/progress";
import {
  getAdminUserStreak,
  grantStreakFreeze,
  resetUserStreakV2,
} from "@/lib/api/streaks";
import {
  getAdminUserAchievements,
  revokeUserAchievement,
} from "@/lib/api/achievements";

export default function AdminUserDetailPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();
  const roles = user?.roles ?? [];
  const canView = roles.some((r) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(r),
  );
  const isSuperAdmin = roles.includes("SuperAdmin");

  const [amount, setAmount] = useState("50");
  const [reason, setReason] = useState("Customer support compensation");

  const detailQuery = useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: async () => (await getAdminUser(userId)).data!,
    enabled: Boolean(accessToken && canView && userId),
  });

  const streakQuery = useQuery({
    queryKey: ["admin", "users", userId, "streak"],
    queryFn: async () => (await getAdminUserStreak(userId)).data!,
    enabled: Boolean(accessToken && canView && userId),
  });

  const achievementsQuery = useQuery({
    queryKey: ["admin", "users", userId, "achievements"],
    queryFn: async () => (await getAdminUserAchievements(userId)).data!,
    enabled: Boolean(accessToken && canView && userId),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
  };

  const adjustMutation = useMutation({
    mutationFn: () =>
      adjustUserXp(userId, { amount: Number(amount), reason }),
    onSuccess: invalidate,
  });

  const resetMutation = useMutation({
    mutationFn: () => resetUserGamification(userId, reason || "admin reset"),
    onSuccess: invalidate,
  });

  const streakMutation = useMutation({
    mutationFn: () => resetUserStreakV2(userId, reason || "admin streak reset"),
    onSuccess: invalidate,
  });

  const freezeMutation = useMutation({
    mutationFn: () =>
      grantStreakFreeze(userId, {
        amount: 1,
        reason: reason || "Customer support",
      }),
    onSuccess: invalidate,
  });

  const revokeAchievementMutation = useMutation({
    mutationFn: (achievementId: string) =>
      revokeUserAchievement(userId, achievementId, reason || "admin revoke"),
    onSuccess: invalidate,
  });

  const suspendMutation = useMutation({
    mutationFn: () =>
      detailQuery.data?.user.status === "suspended"
        ? unsuspendUser(userId, reason)
        : suspendUser(userId, reason),
    onSuccess: invalidate,
  });

  if (!accessToken || !canView) {
    return (
      <p className="text-sm text-muted-foreground">Admin access required.</p>
    );
  }

  const detail = detailQuery.data;
  if (detailQuery.isPending || !detail) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-white">
          {detail.user.displayName}
        </h1>
        <p className="text-sm text-muted-foreground">
          {detail.user.email} · {detail.user.status}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Level", `${detail.level.level} · ${detail.level.title}`],
          ["Total XP", detail.level.totalXp],
          ["Progress", `${detail.level.progressPercentage}%`],
          ["Favorites", detail.stats.favorites],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-xl font-bold text-white">
              {value}
            </p>
          </div>
        ))}
      </section>

      {isSuperAdmin ? (
        <section className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="font-display text-lg font-semibold text-white">
            Admin actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-24 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-sm text-white"
              placeholder="XP"
            />
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-w-[16rem] flex-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-sm text-white"
              placeholder="Reason"
            />
            <Button
              size="sm"
              onClick={() => adjustMutation.mutate()}
              disabled={adjustMutation.isPending}
            >
              Adjust XP
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (confirm("Reset gamification for this user?")) {
                  resetMutation.mutate();
                }
              }}
            >
              Reset gamification
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => streakMutation.mutate()}
            >
              Reset streak
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => freezeMutation.mutate()}
            >
              Grant freeze
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => suspendMutation.mutate()}
            >
              {detail.user.status === "suspended" ? "Unsuspend" : "Suspend"}
            </Button>
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
        <h2 className="font-display text-lg font-semibold text-white">Streak</h2>
        <p className="mt-2 text-muted-foreground">
          Current: {streakQuery.data?.streak.currentStreak ?? "—"} · Longest:{" "}
          {streakQuery.data?.streak.longestStreak ?? "—"} · Status:{" "}
          {streakQuery.data?.streak.status ?? "—"} · Freeze:{" "}
          {streakQuery.data?.streak.freezeCount ?? 0}/
          {streakQuery.data?.streak.maxFreezeCount ?? 2}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-white">
          Achievements
        </h2>
        {(achievementsQuery.data ?? [])
          .filter((a) => a.isUnlocked)
          .map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm"
            >
              <div>
                <p className="text-white">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.code}</p>
              </div>
              {isSuperAdmin ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={revokeAchievementMutation.isPending}
                  onClick={() => {
                    if (confirm(`Revoke ${a.code}?`)) {
                      revokeAchievementMutation.mutate(a.id);
                    }
                  }}
                >
                  Revoke
                </Button>
              ) : null}
            </div>
          ))}
        {(achievementsQuery.data ?? []).filter((a) => a.isUnlocked).length ===
        0 ? (
          <p className="text-sm text-muted-foreground">No unlocks yet.</p>
        ) : null}
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-white">
          Recent XP
        </h2>
        {detail.recentTransactions.map((tx) => (
          <div
            key={tx.transactionId}
            className="flex justify-between rounded-lg border border-white/10 px-3 py-2 text-sm"
          >
            <span className="text-muted-foreground">
              {xpRuleLabel(tx.ruleCode, tx.description)}
            </span>
            <span className="text-white">
              {tx.xpAmount >= 0 ? "+" : ""}
              {tx.xpAmount}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
