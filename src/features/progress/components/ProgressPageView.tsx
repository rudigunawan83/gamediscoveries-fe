"use client";

import { useLocale, useTranslations, type Messages } from "next-intl";
import Link from "next/link";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarDays,
  Crown,
  Flame,
  Gamepad2,
  Lock,
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
import { getMyLeaderboardRank } from "@/lib/api/leaderboards";
import { getMyMissionHistory, getMyMissions, type MissionDto } from "@/lib/api/missions";
import { getMyProgress, getMyXpTransactions } from "@/lib/api/progress";
import { useFormats } from "@/lib/i18n/format";
import { useXpRuleLabel } from "../hooks/useXpRuleLabel";

type GamificationKey = keyof Messages["Gamification"];

const RANK_BOARD = "GLOBAL_ALL_TIME_XP";

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
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-white/10 px-3 py-3 sm:border-l first:sm:border-l-0">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] text-amber-200">
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-slate-400">{label}</p>
        <p className="font-display text-lg font-black text-white">{value}</p>
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
  const t = useTranslations("Gamification");
  const { grouped } = useFormats();
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
        {t(xp >= 0 ? "xpReward" : "xpAmount", { xp: grouped.format(xp) })}
      </p>
    </div>
  );
}

function MissionRow({
  label,
  missions,
  icon,
  tone,
}: {
  label: GamificationKey;
  missions: MissionDto[];
  icon: ReactNode;
  tone: string;
}) {
  const t = useTranslations("Gamification");
  const done = missions.filter((mission) => mission.status === "COMPLETED").length;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-3">
        <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${tone}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-3 text-sm">
            <p className="font-black text-white">{t(label)}</p>
            <p className="text-slate-400">{done} / {missions.length}</p>
          </div>
          <div className="mt-2">
            <ProgressBar value={missions.length ? (done / missions.length) * 100 : 0} tone={tone} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProgressPageView() {
  const { accessToken } = useAuth();
  const locale = useLocale();
  const t = useTranslations("Gamification");
  const tCommon = useTranslations("Common");
  const ruleLabel = useXpRuleLabel();
  const signedIn = Boolean(accessToken);

  const progressQuery = useQuery({
    queryKey: ["me", "progress"],
    queryFn: async () => (await getMyProgress()).data!,
    enabled: signedIn,
  });

  const xpQuery = useQuery({
    queryKey: ["me", "xp", "transactions", 1],
    queryFn: async () =>
      (await getMyXpTransactions({ page: 1, pageSize: 8 })).data!,
    enabled: signedIn,
  });

  const achievementsQuery = useQuery({
    queryKey: ["me", "achievements"],
    queryFn: async () => (await getMyAchievements()).data!,
    enabled: signedIn,
  });

  const missionsQuery = useQuery({
    queryKey: ["me", "missions"],
    queryFn: async () => (await getMyMissions()).data!,
    enabled: signedIn,
  });

  const completedMissionsQuery = useQuery({
    queryKey: ["me", "missions", "history", "COMPLETED"],
    queryFn: async () => (await getMyMissionHistory({ status: "COMPLETED", pageSize: 1 })).data!,
    enabled: signedIn,
  });

  const rankQuery = useQuery({
    queryKey: ["leaderboards", RANK_BOARD, "me"],
    queryFn: async () => (await getMyLeaderboardRank(RANK_BOARD)).data!,
    enabled: signedIn,
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
        <h1 className="mt-5 font-display text-4xl font-black text-white">{t("progressSignedOutTitle")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
          {t("progressSignedOutMessage")}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-6 py-3 text-sm font-black text-slate-950"
        >
          {t("signInToViewProgress")}
        </Link>
      </div>
    );
  }

  if (progressQuery.isPending) {
    return (
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center text-slate-300">
        {t("loadingProgress")}
      </div>
    );
  }

  if (progressQuery.isError || !progressQuery.data) {
    return (
      <p className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
        {t("progressUnavailable")}
      </p>
    );
  }

  const { user, level, stats, streak } = progressQuery.data;
  const transactions = xpQuery.data?.items ?? [];
  const currentStreak = streak?.current ?? stats.currentStreak;
  const longestStreak = streak?.longest ?? stats.longestStreak;
  const totalAchievements = achievementOverview?.totalDefinitions ?? achievements.length;
  const unlockedAchievements = achievementOverview?.userUnlocked ?? achievements.filter((item) => item.isUnlocked).length;
  const missionsCompleted = completedMissionsQuery.data?.total;
  const rank = rankQuery.data?.rank;
  const missions = missionsQuery.data;

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 text-white">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(245,158,11,0.25),transparent_26%),radial-gradient(circle_at_58%_18%,rgba(14,165,233,0.2),transparent_25%),linear-gradient(110deg,rgba(15,23,42,0.1),rgba(15,23,42,0.9))]" />
        <div className="absolute right-8 top-8 hidden h-56 w-56 rounded-full bg-amber-300/20 blur-3xl lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-amber-200">{t("yourProgress")}</p>
            <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-6xl">
              {t.rich("progressHeroTitle", {
                br: () => <br />,
                highlight: (chunks) => <span className="text-amber-300">{chunks}</span>,
              })}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              {t("progressHeroDescription")}
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
              <p className="text-sm font-bold text-amber-100">{t("keepPlaying")}</p>
              <p className="mt-3 font-display text-5xl font-black text-white">+XP</p>
              <p className="text-sm text-slate-300">{t("doingGreat")}</p>
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
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">
                <Crown className="h-3 w-3" /> {level.title}
              </div>
              <p className="mt-3 max-w-md text-xs text-slate-400">
                {t("profileTagline")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="grid h-28 w-28 place-items-center rounded-[1.75rem] border border-amber-300/30 bg-gradient-to-br from-slate-900 to-amber-950/70">
              <div className="grid h-20 w-20 place-items-center rounded-3xl border-4 border-amber-300 text-center font-display font-black text-amber-200">
                <span className="text-xs">{t("levelShort")}</span>
                <span className="-mt-5 text-3xl">{level.level}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">{t("totalXpLabel")}</p>
              <p className="font-display text-3xl font-black text-white">{level.totalXp.toLocaleString(locale)}</p>
              <div className="mt-3">
                <ProgressBar value={level.progressPercentage} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>
                  {level.isMaxLevel
                    ? t("maxLevelReached")
                    : t("xpToLevel", {
                        xp: (level.nextLevelXp - level.currentLevelXp).toLocaleString(locale),
                        level: level.nextLevel ?? level.level + 1,
                      })}
                </span>
                <span>{t("xpAmount", { xp: level.nextLevelXp.toLocaleString(locale) })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid border-t border-white/10 bg-white/[0.03] sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard icon={<Gamepad2 className="h-5 w-5" />} label={t("gamesPlayed")} value={stats.totalGameSessions.toLocaleString(locale)} />
          <MetricCard icon={<Trophy className="h-5 w-5" />} label={t("achievements")} value={`${unlockedAchievements} / ${totalAchievements || 0}`} />
          <MetricCard icon={<Target className="h-5 w-5" />} label={t("missionsCompletedLabel")} value={missionsCompleted != null ? missionsCompleted.toLocaleString(locale) : "—"} />
          <MetricCard icon={<Flame className="h-5 w-5" />} label={t("currentStreak")} value={t("daysCount", { count: currentStreak })} />
          <MetricCard icon={<Crown className="h-5 w-5" />} label={t("leaderboardRank")} value={rank != null ? `#${rank.toLocaleString(locale)}` : "—"} />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
          <SectionHeader
            icon={<Sparkles className="h-5 w-5" />}
            title={t("achievements")}
            subtitle={t("achievementsHint")}
            action={<Link href="/community/achievements" className="rounded-full border border-amber-300/30 px-4 py-2 text-xs font-bold text-amber-200">{tCommon("viewAll")}</Link>}
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredAchievements.map((item, index) => (
              <AchievementTile key={item.id} item={item} index={index} />
            ))}
            {featuredAchievements.length === 0 ? (
              <p className="text-sm text-slate-400 sm:col-span-2 xl:col-span-4">{t("noAchievements")}</p>
            ) : null}
          </div>
        </div>

        {missions ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
            <SectionHeader
              icon={<Target className="h-5 w-5" />}
              title={t("missionProgress")}
              subtitle={t("missionProgressHint")}
              action={<Link href="/missions" className="rounded-full border border-amber-300/30 px-4 py-2 text-xs font-bold text-amber-200">{tCommon("viewAll")}</Link>}
            />
            <div className="space-y-4">
              <MissionRow
                label="tabDailyMissions"
                missions={missions.daily}
                icon={<CalendarDays className="h-6 w-6 text-white" />}
                tone="from-sky-400 to-blue-600"
              />
              <MissionRow
                label="tabWeeklyChallenges"
                missions={missions.weekly}
                icon={<Trophy className="h-6 w-6 text-white" />}
                tone="from-fuchsia-400 to-purple-700"
              />
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1fr]">
        <div className="rounded-[1.75rem] border border-orange-300/20 bg-gradient-to-br from-orange-950/55 via-slate-950 to-slate-950 p-5 shadow-2xl shadow-black/20">
          <SectionHeader icon={<Flame className="h-5 w-5" />} title={t("playStreak")} subtitle={t("playStreakHint")} />
          <div className="flex items-center gap-4">
            <Flame className="h-20 w-20 text-orange-300" />
            <div>
              <p className="font-display text-6xl font-black text-white">{currentStreak}</p>
              <p className="text-sm text-slate-300">{t("daysInRow")}</p>
              <p className="mt-1 text-xs text-slate-500">{t("longestStreakValue", { count: longestStreak })}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
          <SectionHeader icon={<BarChart3 className="h-5 w-5" />} title={t("recentActivity")} subtitle={t("recentActivityHint")} action={<Link href="/progress/xp" className="rounded-full border border-amber-300/30 px-4 py-2 text-xs font-bold text-amber-200">{tCommon("viewAll")}</Link>} />
          <div className="space-y-3">
            {transactions.slice(0, 3).map((tx, index) => (
              <ActivityItem
                key={tx.transactionId}
                title={ruleLabel(tx.ruleCode, tx.description)}
                subtitle={new Date(tx.createdAt).toLocaleString(locale)}
                xp={tx.xpAmount}
                index={index}
              />
            ))}
            {transactions.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
                {t("noXpActivity")}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
