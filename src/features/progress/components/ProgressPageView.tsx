"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getMyAchievements,
  type AchievementItem,
} from "@/lib/api/achievements";
import {
  getMyProgress,
  getMyXpTransactions,
  xpRuleLabel,
} from "@/lib/api/progress";

const achievementCategories = [
  "ALL",
  "DISCOVERY",
  "GAMEPLAY",
  "EXPLORATION",
  "COLLECTION",
  "SOCIAL",
  "STREAK",
  "PROGRESSION",
  "SPECIAL",
] as const;

function initials(name?: string) {
  return (name || "U").trim().slice(0, 2).toUpperCase();
}

export function ProgressPageView() {
  const { accessToken } = useAuth();
  const [achievementCategory, setAchievementCategory] =
    useState<(typeof achievementCategories)[number]>("ALL");

  const progressQuery = useQuery({
    queryKey: ["me", "progress"],
    queryFn: async () => (await getMyProgress()).data!,
    enabled: Boolean(accessToken),
  });

  const xpQuery = useQuery({
    queryKey: ["me", "xp", "transactions", 1],
    queryFn: async () =>
      (await getMyXpTransactions({ page: 1, pageSize: 8 })).data!,
    enabled: Boolean(accessToken),
  });

  const achievementsQuery = useQuery({
    queryKey: ["me", "achievements"],
    queryFn: async () => (await getMyAchievements()).data!,
    enabled: Boolean(accessToken),
  });

  const achievements = achievementsQuery.data?.items ?? [];
  const achievementOverview = achievementsQuery.data?.overview;
  const filteredAchievements = useMemo(() => {
    if (achievementCategory === "ALL") return achievements;
    return achievements.filter((a) => a.category === achievementCategory);
  }, [achievements, achievementCategory]);
  const recentUnlocks = useMemo(
    () =>
      achievements
        .filter((a) => a.isUnlocked)
        .sort((a, b) =>
          (b.unlockedAt ?? "").localeCompare(a.unlockedAt ?? ""),
        )
        .slice(0, 3),
    [achievements],
  );

  if (!accessToken) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary">
          Sign in
        </Link>{" "}
        to view your progress.
      </p>
    );
  }

  if (progressQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Loading progress…</p>;
  }

  if (progressQuery.isError || !progressQuery.data) {
    return (
      <p className="text-sm text-muted-foreground">
        Unable to load progress right now.
      </p>
    );
  }

  const { user, level, stats, streak } = progressQuery.data;
  const transactions = xpQuery.data?.items ?? [];
  const streakStatus = streak?.status ?? "BROKEN";
  const streakMessage =
    streakStatus === "AT_RISK"
      ? `Your ${streak?.current ?? 0}-day streak is at risk. Play one game today to keep it.`
      : streakStatus === "ACTIVE" && streak?.todayQualified
        ? "You're all set for today."
        : streakStatus === "FROZEN"
          ? "Streak freeze used — your streak is protected."
          : streakStatus === "BROKEN" || (streak?.current ?? 0) === 0
            ? "Start a new streak by playing a valid game session."
            : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="flex items-center gap-4">
        <Avatar size="lg" className="size-16 data-[size=lg]:size-16">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-display text-2xl font-bold text-white">
            {user.name}
          </p>
          <p className="text-sm text-primary">{level.title}</p>
          <p className="text-xs text-muted-foreground">Level {level.level}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Level {level.level}
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              {level.title}
            </h2>
          </div>
          <p className="font-display text-2xl font-semibold text-white">
            {level.totalXp.toLocaleString()} XP
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-brand-gradient transition-all"
              style={{ width: `${Math.min(100, level.progressPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {level.currentLevelXp.toLocaleString()} /{" "}
              {level.isMaxLevel
                ? "MAX"
                : `${level.nextLevelXp.toLocaleString()} XP`}
            </span>
            <span>{level.progressPercentage}%</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {level.isMaxLevel
            ? "Maximum level reached."
            : `Next: Level ${level.nextLevel} — ${level.nextTitle ?? "Next Title"}`}
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-white/[0.03] p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Streak
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              {streak?.current ?? stats.currentStreak} day
              {(streak?.current ?? stats.currentStreak) === 1 ? "" : "s"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Status: {streakStatus.replaceAll("_", " ")}
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Longest: {streak?.longest ?? stats.longestStreak} days</p>
            <p>
              Freeze: {streak?.freezeCount ?? 0}
            </p>
            {streak?.nextMilestone ? (
              <p>Next milestone: {streak.nextMilestone} days</p>
            ) : null}
          </div>
        </div>
        {streakMessage ? (
          <p className="mt-4 text-sm text-white/90">{streakMessage}</p>
        ) : null}
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Sessions", stats.totalGameSessions],
          ["Games", stats.uniqueGamesPlayed],
          ["Favorites", stats.favorites],
          ["Longest streak", streak?.longest ?? stats.longestStreak],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-white">
            Recent XP
          </h3>
          <Button asChild variant="ghost" size="sm">
            <Link href="/progress/xp">View All</Link>
          </Button>
        </div>
        <ul className="space-y-2">
          {transactions.map((tx) => (
            <li
              key={tx.transactionId}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="text-sm text-white">
                  {xpRuleLabel(tx.ruleCode, tx.description)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tx.createdAt).toLocaleString()}
                </p>
              </div>
              <p
                className={`font-semibold ${tx.xpAmount >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {tx.xpAmount >= 0 ? "+" : ""}
                {tx.xpAmount} XP
              </p>
            </li>
          ))}
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No XP activity yet. Play a game to get started.
            </p>
          ) : null}
        </ul>
      </section>

      {recentUnlocks.length > 0 ? (
        <section className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-200">
            Achievement unlocked
          </p>
          <div className="mt-2 space-y-2">
            {recentUnlocks.map((item) => (
              <div key={item.id} className="text-sm text-white">
                <span className="font-semibold">{item.title}</span>
                <span className="text-muted-foreground">
                  {" "}
                  — +{item.rewardXp} XP
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-white">
              Achievements
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Unlocked {achievementOverview?.userUnlocked ?? 0} /{" "}
              {achievementOverview?.totalDefinitions ?? achievements.length}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {achievementOverview?.completionPercentage ?? 0}% complete
          </p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-amber-400 transition-all"
            style={{
              width: `${Math.min(100, achievementOverview?.completionPercentage ?? 0)}%`,
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {achievementCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setAchievementCategory(cat)}
              className={`rounded-lg border px-3 py-1.5 text-xs ${
                achievementCategory === cat
                  ? "border-amber-400/50 bg-amber-400/15 text-white"
                  : "border-white/10 bg-white/5 text-muted-foreground"
              }`}
            >
              {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {achievementsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading achievements…</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAchievements.map((item) => (
              <AchievementCard key={item.id} item={item} />
            ))}
            {filteredAchievements.length === 0 ? (
              <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
                No achievements in this category yet.
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-dashed border-white/15 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Missions
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Daily missions and weekly challenges.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/missions">View Missions</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function AchievementCard({ item }: { item: AchievementItem }) {
  const unlocked = item.isUnlocked;
  return (
    <article
      className={`rounded-xl border p-4 ${
        unlocked
          ? "border-amber-400/30 bg-gradient-to-b from-amber-500/10 to-white/[0.03]"
          : "border-white/10 bg-white/[0.03] opacity-80"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-2xl" aria-hidden>
          {unlocked ? "🏆" : item.isSecret ? "❓" : "🎖️"}
        </p>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {item.difficulty}
        </span>
      </div>
      <h4 className="mt-2 font-display text-lg font-semibold text-white">
        {item.title}
      </h4>
      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
      {!item.isSecret || unlocked ? (
        <>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-400"
              style={{ width: `${Math.min(100, item.progressPercentage)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {item.progressValue}/{item.targetValue}
            </span>
            <span>+{item.rewardXp} XP</span>
          </div>
        </>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">Hidden requirement</p>
      )}
      {unlocked && item.unlockedAt ? (
        <p className="mt-2 text-xs text-amber-200/80">
          Unlocked {new Date(item.unlockedAt).toLocaleDateString()}
        </p>
      ) : null}
    </article>
  );
}
