"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  BarChart3,
  Boxes,
  Crown,
  Flame,
  Gamepad2,
  Gem,
  Gift,
  Grid2X2,
  Heart,
  Lock,
  Medal,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
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

const TABS = [
  "Overview",
  "Level & XP",
  "Achievements",
  "Missions",
  "Streak",
  "Game Stats",
] as const;

function initials(name?: string) {
  return (name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function ProgressBar({ value, tone = "from-amber-200 to-orange-500" }: { value: number; tone?: string }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${tone} shadow-[0_0_18px_rgba(251,191,36,0.45)]`}
        style={{ width: `${clamp(value)}%` }}
      />
    </div>
  );
}

function AvatarMedallion({ name, image }: { name: string; image?: string | null }) {
  return (
    <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-200 via-orange-400 to-rose-500 p-1 shadow-2xl shadow-amber-500/25">
      <div className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-slate-950">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-4xl font-black text-amber-200">{initials(name)}</span>
        )}
      </div>
      <span className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-sky-500 text-white">
        <BadgeCheck className="h-4 w-4" />
      </span>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-white/10 px-3 py-3 sm:border-l first:sm:border-l-0">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] text-amber-200">
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-slate-400">{label}</p>
        <p className="font-display text-lg font-black text-white">{value}</p>
        {sub ? <p className="text-[10px] text-emerald-300">{sub}</p> : null}
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-300/15 text-amber-200">
          {icon}
        </div>
        <div>
          <h2 className="font-display text-xl font-black text-white">{title}</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function LevelNode({
  level,
  xp,
  active,
  complete,
}: {
  level: number;
  xp: number;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <div className="flex min-w-24 flex-col items-center">
      <div
        className={`grid h-16 w-16 place-items-center rounded-2xl border-2 font-display font-black ${
          active
            ? "border-amber-300 bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 shadow-xl shadow-amber-500/25"
            : complete
              ? "border-emerald-300/40 bg-amber-300/15 text-amber-100"
              : "border-slate-500/40 bg-slate-800 text-slate-400"
        }`}
      >
        <div className="text-center leading-none">
          <p className="text-[10px]">Lv</p>
          <p className="text-xl">{level}</p>
        </div>
      </div>
      <p className="mt-2 text-xs font-bold text-white">{xp.toLocaleString()} XP</p>
      <p className={`text-[10px] ${complete ? "text-emerald-300" : active ? "text-amber-200" : "text-slate-500"}`}>
        {complete ? "Completed" : active ? "Current Level" : "Locked"}
      </p>
    </div>
  );
}

function AchievementTile({ item, index }: { item: AchievementItem; index: number }) {
  const unlocked = item.isUnlocked;
  const icons = [Gamepad2, Star, MessageCircle, Zap];
  const Icon = icons[index % icons.length];
  const tones = [
    "from-amber-300 to-orange-600",
    "from-orange-400 to-rose-600",
    "from-sky-300 to-blue-700",
    "from-fuchsia-400 to-purple-800",
  ];
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className={`mx-auto grid h-24 w-24 place-items-center rounded-[1.7rem] bg-gradient-to-br ${tones[index % tones.length]} shadow-xl shadow-black/30 ${unlocked ? "" : "grayscale opacity-70"}`}>
        {unlocked ? <Icon className="h-11 w-11 text-white" /> : <Lock className="h-10 w-10 text-white" />}
      </div>
      <h3 className="mt-4 text-center text-sm font-black text-white">{item.title}</h3>
      <p className="text-center text-xs text-slate-500">{item.description}</p>
      <div className="mt-4">
        <ProgressBar value={item.progressPercentage} tone="from-amber-200 to-yellow-500" />
        <p className="mt-2 text-center text-xs text-slate-400">
          {item.progressValue} / {item.targetValue}
        </p>
      </div>
    </article>
  );
}

function ActivityItem({
  title,
  subtitle,
  xp,
  index,
}: {
  title: string;
  subtitle: string;
  xp: number;
  index: number;
}) {
  const tones = ["from-amber-300 to-orange-500", "from-sky-400 to-indigo-700", "from-violet-500 to-rose-600"];
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center gap-3">
        <div className={`h-14 w-20 rounded-xl bg-gradient-to-br ${tones[index % tones.length]}`} />
        <div>
          <p className="text-sm font-black text-white">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <p className={`shrink-0 text-sm font-black ${xp >= 0 ? "text-amber-200" : "text-rose-300"}`}>
        {xp >= 0 ? "+" : ""}{xp} XP
      </p>
    </div>
  );
}

function CategoryRow({
  icon,
  label,
  value,
  percent,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  percent: number;
  tone: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</div>
      <div>
        <p className="text-sm font-black text-white">{label}</p>
        <p className="text-xs text-slate-500">{value}</p>
      </div>
      <div className="w-36">
        <ProgressBar value={percent} tone={tone.includes("pink") ? "from-pink-400 to-fuchsia-500" : tone.includes("emerald") ? "from-emerald-300 to-green-500" : tone.includes("sky") ? "from-sky-300 to-blue-500" : "from-amber-300 to-orange-500"} />
      </div>
    </div>
  );
}

export function ProgressPageView() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");

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

  const achievements = useMemo(
    () => achievementsQuery.data?.items ?? [],
    [achievementsQuery.data?.items],
  );
  const achievementOverview = achievementsQuery.data?.overview;
  const featuredAchievements = useMemo(() => {
    const unlocked = achievements.filter((item) => item.isUnlocked);
    const locked = achievements.filter((item) => !item.isUnlocked);
    return [...unlocked, ...locked].slice(0, 4);
  }, [achievements]);

  if (!accessToken) {
    return (
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950">
          <Sparkles className="h-10 w-10" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-black text-white">Level Up Your Journey</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
          Masuk untuk melihat XP, level, achievement, streak, dan aktivitas progress kamu.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-6 py-3 text-sm font-black text-slate-950"
        >
          Sign in to view progress
        </Link>
      </div>
    );
  }

  if (progressQuery.isPending) {
    return (
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center text-slate-300">
        Loading progress…
      </div>
    );
  }

  if (progressQuery.isError || !progressQuery.data) {
    return (
      <p className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
        Unable to load progress right now.
      </p>
    );
  }

  const { user, level, stats, streak } = progressQuery.data;
  const transactions = xpQuery.data?.items ?? [];
  const currentStreak = streak?.current ?? stats.currentStreak;
  const longestStreak = streak?.longest ?? stats.longestStreak;
  const totalAchievements = achievementOverview?.totalDefinitions ?? achievements.length;
  const unlockedAchievements = achievementOverview?.userUnlocked ?? achievements.filter((item) => item.isUnlocked).length;
  const missionCompletions = transactions.filter((tx) => tx.ruleCode.includes("MISSION")).length;
  const levelNodes = [
    { level: Math.max(1, level.level - 2), xp: Math.max(0, level.totalXp - 8_450), complete: true },
    { level: Math.max(1, level.level - 1), xp: Math.max(0, level.totalXp - 3_450), complete: true },
    { level: level.level, xp: level.totalXp, active: true },
    { level: level.nextLevel ?? level.level + 1, xp: level.nextLevelXp || level.totalXp + 1_550 },
    { level: (level.nextLevel ?? level.level + 1) + 1, xp: (level.nextLevelXp || level.totalXp + 1_550) + 5_000 },
  ];

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 text-white">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(245,158,11,0.25),transparent_26%),radial-gradient(circle_at_58%_18%,rgba(14,165,233,0.2),transparent_25%),linear-gradient(110deg,rgba(15,23,42,0.1),rgba(15,23,42,0.9))]" />
        <div className="absolute right-8 top-8 hidden h-56 w-56 rounded-full bg-amber-300/20 blur-3xl lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-amber-200">Your Progress</p>
            <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-6xl">
              Level Up <br />
              <span className="text-amber-300">Your Journey</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Track your XP, level, achievements, and overall progress. Play games,
              complete missions, and unlock new rewards.
            </p>
          </div>

          <div className="relative min-h-[250px] overflow-hidden rounded-[2rem] border border-amber-200/20 bg-gradient-to-br from-sky-500/20 via-slate-950/60 to-amber-500/20 p-6">
            <div className="absolute right-10 top-8 grid h-28 w-28 place-items-center rounded-full bg-amber-300/20 text-amber-200">
              <ShieldCheck className="h-16 w-16" />
            </div>
            <div className="absolute bottom-8 left-8 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-sky-400 to-blue-700 shadow-2xl shadow-blue-500/20">
              <Gamepad2 className="h-10 w-10 text-white" />
            </div>
            <div className="relative z-10 max-w-xs">
              <p className="text-sm font-bold text-amber-100">Keep playing!</p>
              <p className="mt-3 font-display text-5xl font-black text-white">+XP</p>
              <p className="text-sm text-slate-300">You&apos;re doing great.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/25">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="flex flex-wrap items-center gap-5">
            <AvatarMedallion name={user.name} image={user.avatarUrl} />
            <div>
              <h2 className="font-display text-3xl font-black text-white">{user.name}</h2>
              <p className="text-sm text-slate-400">@{user.name.toLowerCase().replaceAll(" ", "")}</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">
                <Crown className="h-3 w-3" /> {level.title}
              </div>
              <p className="mt-3 max-w-md text-xs text-slate-400">
                Discovering amazing games and leveling up everyday.
              </p>
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="h-3 w-3" /> Joined Oct 2024
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="grid h-28 w-28 place-items-center rounded-[1.75rem] border border-amber-300/30 bg-gradient-to-br from-slate-900 to-amber-950/70">
              <div className="grid h-20 w-20 place-items-center rounded-3xl border-4 border-amber-300 text-center font-display font-black text-amber-200">
                <span className="text-xs">Lv</span>
                <span className="-mt-5 text-3xl">{level.level}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total XP</p>
              <p className="font-display text-3xl font-black text-white">{level.totalXp.toLocaleString()}</p>
              <div className="mt-3">
                <ProgressBar value={level.progressPercentage} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>
                  {level.isMaxLevel ? "Max level reached" : `${(level.nextLevelXp - level.currentLevelXp).toLocaleString()} XP to Level ${level.nextLevel}`}
                </span>
                <span>{level.nextLevelXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid border-t border-white/10 bg-white/[0.03] sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard icon={<Gamepad2 className="h-5 w-5" />} label="Games Played" value={stats.totalGameSessions.toLocaleString()} />
          <MetricCard icon={<Trophy className="h-5 w-5" />} label="Achievements" value={`${unlockedAchievements} / ${totalAchievements || 0}`} />
          <MetricCard icon={<Target className="h-5 w-5" />} label="Missions Completed" value={missionCompletions.toLocaleString()} />
          <MetricCard icon={<Flame className="h-5 w-5" />} label="Current Streak" value={`${currentStreak} days`} />
          <MetricCard icon={<Crown className="h-5 w-5" />} label="Leaderboard Rank" value={`#${Math.max(1, 60 - level.level)}`} sub="+6" />
          <MetricCard icon={<BarChart3 className="h-5 w-5" />} label="Global Percentile" value={`Top ${Math.max(1, 20 - Math.min(level.level, 18))}%`} />
        </div>
      </section>

      <nav className="grid overflow-hidden rounded-2xl border border-white/10 bg-slate-950/75 sm:grid-cols-3 lg:grid-cols-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-white/10 px-4 py-4 text-sm font-bold transition sm:border-l first:sm:border-l-0 ${
              activeTab === tab
                ? "bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
          <SectionHeader
            icon={<Medal className="h-5 w-5" />}
            title="Level Progression"
            subtitle="Play games and complete activities to earn XP and level up."
            action={
              <Link href="/progress/xp" className="rounded-full border border-amber-300/30 px-4 py-2 text-xs font-bold text-amber-200">
                View All Levels
              </Link>
            }
          />
          <div className="relative overflow-x-auto">
            <div className="absolute left-10 right-10 top-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-slate-600" />
            <div className="relative z-10 flex min-w-[560px] justify-between gap-4">
              {levelNodes.map((node) => (
                <LevelNode key={`${node.level}-${node.xp}`} {...node} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
          <SectionHeader
            icon={<Gem className="h-5 w-5" />}
            title="Next Level Rewards"
            subtitle={`Unlock these rewards at Level ${level.nextLevel ?? level.level + 1}.`}
          />
          <div className="grid grid-cols-3 gap-3">
            {[
              ["1x Rare Box", Gift, "from-sky-400 to-blue-700"],
              ["Explorer Badge", ShieldCheck, "from-purple-400 to-fuchsia-700"],
              ["+500 XP", Zap, "from-amber-300 to-orange-600"],
            ].map(([label, Icon, tone]) => {
              const RewardIcon = Icon as typeof Gift;
              return (
                <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <div className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${tone}`}>
                    <RewardIcon className="h-8 w-8 text-white" />
                  </div>
                  <p className="mt-3 text-xs font-bold text-slate-300">{String(label)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
          <SectionHeader
            icon={<Sparkles className="h-5 w-5" />}
            title="Achievements"
            subtitle="Unlock achievements by completing challenges and exploring games."
            action={<Link href="/community/achievements" className="rounded-full border border-amber-300/30 px-4 py-2 text-xs font-bold text-amber-200">View All</Link>}
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredAchievements.map((item, index) => (
              <AchievementTile key={item.id} item={item} index={index} />
            ))}
            {featuredAchievements.length === 0 ? (
              <p className="text-sm text-slate-400 sm:col-span-2 xl:col-span-4">No achievements yet.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
          <SectionHeader icon={<Target className="h-5 w-5" />} title="Mission Progress" subtitle="Complete missions to earn XP and rewards." />
          <div className="space-y-4">
            {[
              ["Daily Missions", 67, "4 / 6", CalendarIcon, "from-sky-400 to-blue-600"],
              ["Weekly Challenges", 40, "2 / 5", Trophy, "from-fuchsia-400 to-purple-700"],
              ["Special Events", 33, "1 / 3", Star, "from-cyan-300 to-blue-500"],
            ].map(([label, value, count, Icon, tone]) => {
              const MissionIcon = Icon as typeof Trophy;
              return (
                <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${tone}`}>
                      <MissionIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3 text-sm">
                        <p className="font-black text-white">{String(label)}</p>
                        <p className="text-slate-400">{String(count)}</p>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={Number(value)} tone={String(tone)} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1fr]">
        <div className="rounded-[1.75rem] border border-orange-300/20 bg-gradient-to-br from-orange-950/55 via-slate-950 to-slate-950 p-5 shadow-2xl shadow-black/20">
          <SectionHeader icon={<Flame className="h-5 w-5" />} title="Play Streak" subtitle="Keep playing to maintain your streak and earn bonus rewards." />
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-center gap-4">
              <Flame className="h-20 w-20 text-orange-300" />
              <div>
                <p className="font-display text-6xl font-black text-white">{currentStreak}</p>
                <p className="text-sm text-slate-300">Days in a row</p>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-300/15 bg-amber-300/10 p-4 text-center">
              <Gift className="mx-auto h-10 w-10 text-amber-200" />
              <p className="mt-2 text-xs font-bold text-white">Next Streak Reward</p>
              <p className="text-xs text-amber-200">+200 XP at {streak?.nextMilestone ?? longestStreak + 2} days</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
              <div key={day} className="text-center">
                <div className={`mx-auto grid h-8 w-8 place-items-center rounded-lg ${index < Math.min(6, currentStreak) ? "bg-emerald-400 text-slate-950" : "bg-white/10 text-slate-400"}`}>
                  {index < Math.min(6, currentStreak) ? <BadgeCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </div>
                <p className="mt-1 text-[10px] text-slate-500">{day}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
          <SectionHeader icon={<Grid2X2 className="h-5 w-5" />} title="Favorite Categories" subtitle="Your most played game categories." action={<Link href="/games" className="rounded-full border border-amber-300/30 px-4 py-2 text-xs font-bold text-amber-200">View Stats</Link>} />
          <div className="space-y-4">
            <CategoryRow icon={<Gamepad2 className="h-5 w-5 text-white" />} label="Puzzle" value={`${Math.max(2, stats.uniqueGamesPlayed)} games`} percent={32} tone="bg-pink-400/20 text-pink-300" />
            <CategoryRow icon={<Target className="h-5 w-5 text-white" />} label="Action" value={`${Math.max(1, Math.round(stats.totalGameSessions / 6))} games`} percent={20} tone="bg-rose-400/20 text-rose-300" />
            <CategoryRow icon={<Heart className="h-5 w-5 text-white" />} label="Casual" value={`${Math.max(1, stats.favorites)} games`} percent={17} tone="bg-emerald-400/20 text-emerald-300" />
            <CategoryRow icon={<MessageCircle className="h-5 w-5 text-white" />} label="Arcade" value={`${Math.max(1, Math.round(stats.totalGameSessions / 8))} games`} percent={14} tone="bg-sky-400/20 text-sky-300" />
            <CategoryRow icon={<Boxes className="h-5 w-5 text-white" />} label="Strategy" value={`${Math.max(1, Math.round(stats.uniqueGamesPlayed / 2))} games`} percent={10} tone="bg-amber-400/20 text-amber-300" />
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
        <SectionHeader icon={<ClockIcon />} title="Recent Activity" subtitle="Your latest games, achievements, and progress." action={<Link href="/progress/xp" className="rounded-full border border-amber-300/30 px-4 py-2 text-xs font-bold text-amber-200">View All</Link>} />
        <div className="space-y-3">
          {transactions.slice(0, 3).map((tx, index) => (
            <ActivityItem
              key={tx.transactionId}
              title={xpRuleLabel(tx.ruleCode, tx.description)}
              subtitle={new Date(tx.createdAt).toLocaleString()}
              xp={tx.xpAmount}
              index={index}
            />
          ))}
          {transactions.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
              No XP activity yet. Play a game to get started.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function CalendarIcon(props: ComponentProps<typeof Target>) {
  return <Target {...props} />;
}

function ClockIcon() {
  return <BarChart3 className="h-5 w-5" />;
}
