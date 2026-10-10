"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  Flame,
  Gamepad2,
  Gift,
  Grid2X2,
  Heart,
  MessageSquareText,
  Star,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getMyMissions, type MissionDto } from "@/lib/api/missions";
import { getMyProgress } from "@/lib/api/progress";
import { useFormats } from "@/lib/i18n/format";

function missionIcon(mission: MissionDto) {
  const text = `${mission.title} ${mission.requirementType} ${mission.code}`.toLowerCase();
  if (text.includes("favorite")) return { icon: Heart, tone: "from-rose-400 to-orange-500" };
  if (text.includes("review")) return { icon: MessageSquareText, tone: "from-sky-400 to-blue-700" };
  if (text.includes("rating") || text.includes("rate")) return { icon: Star, tone: "from-amber-300 to-orange-500" };
  if (text.includes("time") || text.includes("minute") || text.includes("active")) return { icon: Timer, tone: "from-cyan-300 to-blue-600" };
  if (text.includes("category") || text.includes("genre")) return { icon: Grid2X2, tone: "from-indigo-400 to-blue-700" };
  return { icon: Gamepad2, tone: "from-sky-400 to-indigo-700" };
}

function percent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function MissionCard({ mission }: { mission: MissionDto }) {
  const completed = mission.status === "COMPLETED";
  const visual = missionIcon(mission);
  const Icon = visual.icon;
  const progress = percent(mission.percentage);
  const t = useTranslations("Gamification");
  const tGame = useTranslations("Game");
  const { grouped } = useFormats();

  return (
    <article className="group rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-lg shadow-black/10 transition hover:border-amber-300/30 hover:bg-white/[0.065]">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex gap-4">
          <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${visual.tone} shadow-lg shadow-black/25`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-black text-white">{mission.title}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">{mission.description}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 shadow-[0_0_16px_rgba(251,191,36,0.45)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="shrink-0 text-xs font-bold text-slate-300">
                {mission.progress} / {mission.target}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-right">
            <span className="inline-grid h-8 w-8 place-items-center rounded-full border border-amber-300/40 bg-amber-300/10 text-amber-200">
              XP
            </span>
            <p className="mt-1 text-xs font-black text-amber-200">
              {t("xpReward", { xp: grouped.format(mission.rewardXp) })}
            </p>
          </div>
          {completed ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-400/15 px-4 py-2 text-xs font-black text-emerald-200">
              <Check className="h-3 w-3" /> {t("claimed")}
            </span>
          ) : (
            <Link
              href="/games"
              className="rounded-full border border-amber-300/40 bg-slate-950/70 px-4 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-300 hover:text-slate-950"
            >
              {tGame("playNow")}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-orange-500 shadow-[0_0_18px_rgba(251,191,36,0.5)]"
        style={{ width: `${percent(value)}%` }}
      />
    </div>
  );
}

export function MissionsPageView() {
  const { accessToken } = useAuth();
  const locale = useLocale();
  const t = useTranslations("Gamification");
  const tNav = useTranslations("Nav");
  const { grouped, countdown } = useFormats();
  const [tick, setTick] = useState(0);

  const query = useQuery({
    queryKey: ["me", "missions"],
    queryFn: async () => (await getMyMissions()).data!,
    enabled: Boolean(accessToken),
    refetchInterval: 60_000,
  });

  const progressQuery = useQuery({
    queryKey: ["me", "progress"],
    queryFn: async () => (await getMyProgress()).data!,
    enabled: Boolean(accessToken),
  });

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!accessToken) {
    return (
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950">
          <Trophy className="h-10 w-10" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-black text-white">
          {t.rich("missionsHeroTitle", { highlight: (chunks) => chunks })}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
          {t("missionsSignedOutMessage")}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-6 py-3 text-sm font-black text-slate-950"
        >
          {t("signInToViewMissions")}
        </Link>
      </div>
    );
  }

  if (query.isPending) {
    return (
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center text-slate-300">
        {t("loadingMissions")}
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <p className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
        {t("missionsUnavailable")}
      </p>
    );
  }

  const data = query.data;
  const level = progressQuery.data?.level.level;
  const streak = progressQuery.data?.streak?.current ?? progressQuery.data?.stats.currentStreak;
  const weeklyMain = data.weekly[0];
  const totalCompleted = [...data.daily, ...data.weekly].filter((m) => m.status === "COMPLETED").length;
  const allTotal = Math.max(data.daily.length + data.weekly.length, 1);
  void tick;

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 text-white">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(245,158,11,0.26),transparent_26%),radial-gradient(circle_at_58%_18%,rgba(124,58,237,0.28),transparent_25%),linear-gradient(110deg,rgba(15,23,42,0.1),rgba(15,23,42,0.9))]" />
        <div className="absolute right-6 top-8 hidden h-56 w-56 rounded-full bg-amber-300/20 blur-3xl lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-amber-200">{tNav("missions")}</p>
            <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-6xl">
              {t.rich("missionsHeroTitle", {
                highlight: (chunks) => <span className="text-amber-300">{chunks}</span>,
              })}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              {t("missionsHeroDescription")}
            </p>
          </div>

          <div className="relative min-h-[250px] overflow-hidden rounded-[2rem] border border-amber-200/20 bg-gradient-to-br from-violet-600/20 via-slate-950/60 to-amber-500/20 p-6">
            <div className="absolute right-10 top-8 grid h-28 w-28 place-items-center rounded-full bg-amber-300/20 text-amber-200">
              <Zap className="h-16 w-16" />
            </div>
            <div className="absolute bottom-6 left-8 grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-600 shadow-2xl shadow-amber-500/20">
              <Gift className="h-12 w-12 text-white" />
            </div>
            <div className="relative z-10 max-w-xs">
              <p className="text-sm font-bold text-amber-100">{t("rewardPool")}</p>
              <p className="mt-3 font-display text-5xl font-black text-white">
                {data.daily.reduce((sum, mission) => sum + mission.rewardXp, 0).toLocaleString(locale)}
              </p>
              <p className="text-sm text-slate-300">{t("dailyXpAvailable")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
          <div className={`grid gap-6 ${level != null ? "md:grid-cols-[auto_1fr]" : ""} md:items-center`}>
            {level != null ? (
              <div className="grid h-28 w-28 place-items-center rounded-[1.75rem] border border-amber-300/30 bg-gradient-to-br from-slate-900 to-amber-950/70">
                <div className="grid h-20 w-20 place-items-center rounded-3xl border-4 border-amber-300 text-center font-display font-black text-amber-200">
                  <span className="text-xs">{t("levelShort")}</span>
                  <span className="-mt-5 text-3xl">{level}</span>
                </div>
              </div>
            ) : null}
            <div>
              <h2 className="font-display text-xl font-black text-white">{t("missionProgress")}</h2>
              <p className="mt-1 text-xs text-slate-400">{t("missionProgressHint")}</p>
              <div className="mt-4 max-w-md">
                <ProgressBar value={(totalCompleted / allTotal) * 100} />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-300">
                {t("missionsCompletedCount", { done: totalCompleted, total: allTotal })}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-2 font-display text-xl font-black text-white">
                <CalendarDays className="h-5 w-5 text-amber-300" /> {t("tabDailyMissions")}
              </p>
              <p className="text-xs text-slate-500">
                {t("newMissionsIn", { time: countdown(data.dailyExpiresAt) })}
              </p>
            </div>
            <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
              {data.timeZone}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.75fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="flex items-center gap-2 font-display text-2xl font-black text-white">
                <CalendarDays className="h-6 w-6 text-amber-300" /> {t("tabDailyMissions")}
              </p>
              <p className="text-xs text-slate-500">
                {t("newMissionsIn", { time: countdown(data.dailyExpiresAt) })}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {data.daily.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
            {data.daily.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
                {t("noDailyMissions")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          {weeklyMain ? (
            <aside className="overflow-hidden rounded-[1.75rem] border border-violet-300/20 bg-gradient-to-br from-violet-700/45 via-slate-950 to-orange-950/40 p-5 shadow-2xl shadow-violet-950/20">
              <p className="flex items-center gap-2 font-display text-xl font-black text-white">
                <Trophy className="h-5 w-5 text-pink-200" /> {t("weeklyChallenge")}
              </p>
              <p className="text-xs text-slate-300">
                {t("endsIn", { time: countdown(data.weeklyExpiresAt) })}
              </p>
              <div className="mt-5 h-32 rounded-3xl bg-[radial-gradient(circle_at_50%_35%,rgba(251,191,36,0.55),transparent_28%),linear-gradient(135deg,rgba(59,130,246,0.5),rgba(168,85,247,0.55),rgba(249,115,22,0.45))]" />
              <h3 className="mt-5 font-display text-xl font-black text-white">{weeklyMain.title}</h3>
              <p className="mt-1 text-xs text-slate-300">{weeklyMain.description}</p>
              <div className="mt-4">
                <ProgressBar value={weeklyMain.percentage} />
                <p className="mt-2 text-right text-xs font-bold text-slate-300">
                  {weeklyMain.progress} / {weeklyMain.target}
                </p>
              </div>
              <p className="mt-4 text-xs font-black text-amber-200">
                {t("xpReward", { xp: grouped.format(weeklyMain.rewardXp) })}
              </p>
            </aside>
          ) : null}

          {streak != null ? (
            <aside className="rounded-[1.75rem] border border-orange-300/20 bg-gradient-to-br from-orange-950/55 via-slate-950 to-slate-950 p-5 shadow-2xl shadow-black/20">
              <p className="flex items-center gap-2 font-display text-xl font-black text-white">
                <Flame className="h-6 w-6 text-orange-300" /> {t("currentStreak")}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <Flame className="h-10 w-10 text-amber-300" />
                <p className="font-display text-4xl font-black text-white">{streak}</p>
                <p className="text-sm text-slate-300">{t("daysInRow")}</p>
              </div>
            </aside>
          ) : null}
        </div>
      </section>
    </div>
  );
}
