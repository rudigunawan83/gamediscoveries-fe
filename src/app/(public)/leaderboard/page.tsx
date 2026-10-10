"use client";

import { useLocale, useTranslations, type Messages } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Crown,
  Gamepad2,
  Medal,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { MobileLeaderboard } from "@/features/mobile-tabs/components/MobileLeaderboard";
import { analytics } from "@/lib/analytics/client";
import {
  getLeaderboard,
  getMyLeaderboardRank,
  listLeaderboards,
  type LeaderboardItemDto,
  type UserRankResponse,
} from "@/lib/api/leaderboards";

type GamificationKey = keyof Messages["Gamification"];
type GamificationTranslator = ReturnType<typeof useTranslations<"Gamification">>;
type TimeTranslator = ReturnType<typeof useTranslations<"Time">>;

const BOARDS = [
  { code: "GLOBAL_WEEKLY_XP", label: "weekly" },
  { code: "GLOBAL_MONTHLY_XP", label: "monthly" },
  { code: "GLOBAL_ALL_TIME_XP", label: "allTime" },
] as const satisfies readonly ({ label: GamificationKey } & Record<string, unknown>)[];

function countdown(t: GamificationTranslator, time: TimeTranslator, endAt?: string | null) {
  if (!endAt) return null;
  const ms = new Date(endAt).getTime() - Date.now();
  if (ms <= 0) return t("periodEnding");
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${time("days", { count: d })} ${time("hours", { count: h })} ${time("minutes", { count: m })}`;
}

function countdownParts(endAt?: string | null) {
  if (!endAt) return [
    { label: "unitDays", value: "--" },
    { label: "unitHours", value: "--" },
    { label: "unitMinutes", value: "--" },
    { label: "unitSeconds", value: "--" },
  ] as const;

  const ms = Math.max(new Date(endAt).getTime() - Date.now(), 0);
  return [
    { label: "unitDays", value: String(Math.floor(ms / 86_400_000)).padStart(2, "0") },
    { label: "unitHours", value: String(Math.floor((ms % 86_400_000) / 3_600_000)).padStart(2, "0") },
    { label: "unitMinutes", value: String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, "0") },
    { label: "unitSeconds", value: String(Math.floor((ms % 60_000) / 1_000)).padStart(2, "0") },
  ] as const;
}

function formatMovement(t: GamificationTranslator, movement?: string | null, rankChange?: number | null) {
  if (movement === "NEW") return { label: t("movementNew"), tone: "text-sky-300 bg-sky-400/10" };
  if (movement?.startsWith("UP_") || (rankChange ?? 0) > 0) {
    const value = movement?.startsWith("UP_") ? movement.slice(3) : rankChange;
    return { label: `+${value}`, tone: "text-emerald-300 bg-emerald-400/10" };
  }
  if (movement?.startsWith("DOWN_") || (rankChange ?? 0) < 0) {
    const value = movement?.startsWith("DOWN_") ? movement.slice(5) : Math.abs(rankChange ?? 0);
    return { label: `-${value}`, tone: "text-rose-300 bg-rose-400/10" };
  }
  return { label: "—", tone: "text-slate-300 bg-white/5" };
}

function playerName(fallback: string, item?: LeaderboardItemDto) {
  return item?.user.displayName || item?.user.username || fallback;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";
}

function avatarClass(index: number) {
  const gradients = [
    "from-amber-300 via-orange-400 to-rose-500",
    "from-cyan-300 via-sky-400 to-blue-600",
    "from-pink-300 via-fuchsia-400 to-purple-600",
    "from-emerald-300 via-teal-400 to-cyan-600",
    "from-violet-300 via-indigo-400 to-blue-600",
  ];
  return gradients[index % gradients.length];
}

function RankAvatar({
  name,
  index,
  size = "md",
}: {
  name: string;
  index: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-20 w-20 text-2xl" : size === "sm" ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";
  return (
    <div
      className={`${sizeClass} grid shrink-0 place-items-center rounded-full border-2 border-white/25 bg-gradient-to-br ${avatarClass(index)} font-display font-black text-slate-950 shadow-[0_0_28px_rgba(251,191,36,0.3)]`}
    >
      {initials(name)}
    </div>
  );
}

function Podium({ items }: { items: LeaderboardItemDto[] }) {
  const first = items.find((i) => i.rank === 1);
  const second = items.find((i) => i.rank === 2);
  const third = items.find((i) => i.rank === 3);
  const locale = useLocale();
  const t = useTranslations("Gamification");
  const fallbackName = useTranslations("Profile")("defaultName");
  const slots = [
    { item: second, place: 2, label: "2", height: "h-28 sm:h-36", tone: "from-sky-300/70 to-sky-500/20", offset: "mt-10" },
    { item: first, place: 1, label: "1", height: "h-40 sm:h-52", tone: "from-amber-300/90 to-orange-500/30", offset: "" },
    { item: third, place: 3, label: "3", height: "h-24 sm:h-32", tone: "from-fuchsia-300/70 to-rose-500/20", offset: "mt-14" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 md:items-end">
      {slots.map(({ item, place, label, height, tone, offset }, index) => {
        const name = playerName(fallbackName, item);
        return (
          <div
            key={place}
            className={`relative flex min-h-[250px] flex-col items-center justify-end overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-4 text-center shadow-2xl shadow-black/30 ${offset}`}
          >
            <div className={`absolute inset-x-8 top-10 h-24 rounded-full bg-gradient-to-r ${tone} blur-2xl`} />
            <div className="relative z-10 mb-3">
              <RankAvatar name={name} index={index} size={place === 1 ? "lg" : "md"} />
              <div className="absolute -right-1 -top-2 grid h-8 w-8 place-items-center rounded-full bg-amber-300 text-sm font-black text-slate-950 shadow-lg">
                {label}
              </div>
            </div>
            <p className="relative z-10 font-display text-lg font-black text-white">{name}</p>
            <p className="relative z-10 text-xs text-slate-400">@{item?.user.username ?? "player"}</p>
            <p className="relative z-10 mt-3 font-display text-2xl font-black text-amber-300">
              {t("xpAmount", { xp: item ? item.score.toLocaleString(locale) : "0" })}
            </p>
            <div className={`mt-4 w-full rounded-t-[1.5rem] border border-white/10 bg-gradient-to-b ${tone} ${height}`} />
          </div>
        );
      })}
    </div>
  );
}

function RankCard({
  me,
  isAuthenticated,
}: {
  me?: UserRankResponse;
  isAuthenticated: boolean;
}) {
  const rank = me?.rank ?? null;
  const score = me?.score ?? 0;
  const locale = useLocale();
  const t = useTranslations("Gamification");
  const tCommon = useTranslations("Common");
  const movement = me ? formatMovement(t, me.rankMovement, me.rankChange) : null;

  return (
    <aside className="rounded-[1.75rem] border border-violet-300/20 bg-gradient-to-br from-violet-700/40 via-slate-950/90 to-blue-950/80 p-5 shadow-2xl shadow-violet-950/30">
      <p className="text-sm font-bold text-white">{t("yourRank")}</p>
      {isAuthenticated ? (
        <>
          <div className="mt-5 flex items-center gap-4">
            <RankAvatar name={t("you")} index={3} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display text-4xl font-black text-white">
                  {rank != null ? `#${rank}` : "—"}
                </p>
                {movement && (
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${movement.tone}`}>
                    {movement.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{t("keepClimbing")}</p>
            </div>
          </div>
          <p className="mt-5 font-display text-2xl font-black text-amber-300">
            {t("xpAmount", { xp: Number(score).toLocaleString(locale) })}
          </p>
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="font-display text-2xl font-black text-white">{tCommon("signIn")}</p>
          <p className="mt-2 text-sm text-slate-300">
            {t("signInRankMessage")}
          </p>
        </div>
      )}
    </aside>
  );
}

function PlayerRow({ item, index }: { item: LeaderboardItemDto; index: number }) {
  const t = useTranslations("Gamification");
  const fallbackName = useTranslations("Profile")("defaultName");
  const name = playerName(fallbackName, item);
  const movement = formatMovement(t, item.rankMovement, item.rankChange);
  const locale = useLocale();
  const trophyColor = item.rank === 1 ? "text-amber-300" : item.rank === 2 ? "text-sky-300" : item.rank === 3 ? "text-orange-300" : "text-slate-400";

  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="py-3 pl-3 pr-2">
        <div className="flex items-center gap-3">
          <span className={`grid h-7 w-7 place-items-center rounded-lg bg-white/5 ${trophyColor}`}>
            {item.rank <= 3 ? <Crown className="h-4 w-4" /> : item.rank}
          </span>
          <RankAvatar name={name} index={index} size="sm" />
          <div>
            <p className="text-sm font-bold text-white">{name}</p>
            <p className="text-xs text-slate-500">@{item.user.username ?? "player"}</p>
          </div>
        </div>
      </td>
      <td className="hidden px-3 py-3 text-center text-sm text-slate-300 sm:table-cell">{item.gamesPlayed}</td>
      <td className="px-3 py-3 text-right font-bold text-amber-300">{item.score.toLocaleString(locale)}</td>
      <td className="px-3 py-3 text-right">
        <span className={`rounded-full px-2 py-1 text-xs font-bold ${movement.tone}`}>{movement.label}</span>
      </td>
    </tr>
  );
}

export default function LeaderboardPage() {
  const { accessToken } = useAuth();
  const [code, setCode] = useState<string>("GLOBAL_WEEKLY_XP");
  const locale = useLocale();
  const t = useTranslations("Gamification");
  const tTime = useTranslations("Time");
  const tNav = useTranslations("Nav");
  const fallbackName = useTranslations("Profile")("defaultName");

  const listQuery = useQuery({
    queryKey: ["leaderboards", "list"],
    queryFn: async () => (await listLeaderboards()).data ?? [],
  });

  const boardQuery = useQuery({
    queryKey: ["leaderboards", code],
    queryFn: async () => (await getLeaderboard(code, 50)).data!,
  });

  const meQuery = useQuery({
    queryKey: ["leaderboards", code, "me"],
    queryFn: async () => (await getMyLeaderboardRank(code)).data!,
    enabled: Boolean(accessToken),
  });

  useEffect(() => {
    analytics.track("community_leaderboard_viewed", {
      section: "xp_leaderboard",
      code,
    });
  }, [code]);

  const endsIn = useMemo(
    () => countdown(t, tTime, boardQuery.data?.leaderboard.period?.endAt),
    [t, tTime, boardQuery.data?.leaderboard.period?.endAt],
  );

  const items = boardQuery.data?.items ?? [];
  const me = meQuery.data;
  const countdownTiles = useMemo(
    () => countdownParts(boardQuery.data?.leaderboard.period?.endAt),
    [boardQuery.data?.leaderboard.period?.endAt],
  );

  return (
    <>
    <div className="mx-auto max-w-xl lg:hidden">
      <MobileLeaderboard />
    </div>
    <main className="relative hidden min-h-screen overflow-hidden bg-[#070917] pb-16 text-white lg:block">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.24),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(124,58,237,0.26),transparent_30%),radial-gradient(circle_at_50%_48%,rgba(14,165,233,0.10),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-transparent via-[#0b1024]/60 to-[#070917]" />

      <div className="container relative z-10 mx-auto max-w-7xl space-y-8 px-4 py-8 sm:py-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/65 p-5 shadow-2xl shadow-black/30 sm:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(251,191,36,0.12),transparent_38%,rgba(124,58,237,0.12))]" />
          <div className="absolute right-8 top-8 hidden h-48 w-48 rounded-full bg-amber-300/20 blur-3xl md:block" />
          <div className="relative">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">
                <Trophy className="h-4 w-4" /> {t("xpCompetition")}
              </div>
              <h1 className="font-display text-4xl font-black tracking-tight text-white sm:text-6xl">
                {tNav("leaderboard")}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                {t("leaderboardDescription")}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {BOARDS.map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => setCode(b.code)}
                    className={`rounded-2xl border px-5 py-2 text-sm font-bold transition ${
                      code === b.code
                        ? "border-amber-300 bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {t(b.label)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.45fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-300/15 text-amber-300">
                  <Medal className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-white">{boardQuery.data?.leaderboard.name ?? t("weeklyLeaderboard")}</p>
                  <p className="text-xs text-slate-400">
                    {code === "GLOBAL_ALL_TIME_XP" ? t("allTimeRanking") : t("endsIn", { time: endsIn ?? "..." })}
                  </p>
                </div>
              </div>
              {code !== "GLOBAL_ALL_TIME_XP" && (
                <div className="grid grid-cols-4 gap-2">
                  {countdownTiles.map((part) => (
                    <div key={part.label} className="min-w-16 rounded-xl bg-white/[0.06] px-3 py-2 text-center">
                      <p className="font-display text-xl font-black text-amber-200">{part.value}</p>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">{t(part.label)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-amber-300/20 bg-gradient-to-r from-slate-950 to-amber-950/40 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">{t("playersCompeting")}</p>
                <p className="font-display text-3xl font-black text-white">{(boardQuery.data?.totalParticipants ?? 0).toLocaleString(locale)}</p>
              </div>
              <div className="flex -space-x-3">
                {items.slice(0, 3).map((item, index) => (
                  <RankAvatar key={item.user.id} name={playerName(fallbackName, item)} index={index} size="sm" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {boardQuery.isPending ? (
          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 text-center text-slate-300">
            {t("loadingRanks")}
          </section>
        ) : (
          <Podium items={items.slice(0, 3)} />
        )}

        <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/20 sm:p-5">
            <p className="mb-4 font-bold text-white">{t("tabTopPlayers")}</p>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-white/[0.04] text-xs text-slate-500">
                  <tr>
                    <th className="py-3 pl-3 text-left font-medium">{t("colPlayer")}</th>
                    <th className="hidden px-3 py-3 text-center font-medium sm:table-cell">{t("colGames")}</th>
                    <th className="px-3 py-3 text-right font-medium">XP</th>
                    <th className="px-3 py-3 text-right font-medium">{t("colRankChange")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.slice(0, 10).map((item, index) => (
                    <PlayerRow key={`${item.user.id}-${item.rank}`} item={item} index={index} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-5">
            <RankCard me={me} isAuthenticated={Boolean(accessToken)} />
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5">
              <p className="font-bold text-white">{t("howToEarn")}</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p className="flex gap-3"><Gamepad2 className="h-5 w-5 text-sky-300" /> {t("earnPlay")}</p>
                <p className="flex gap-3"><Star className="h-5 w-5 text-pink-300" /> {t("earnMissions")}</p>
                <p className="flex gap-3"><Zap className="h-5 w-5 text-amber-300" /> {t("earnStreak")}</p>
              </div>
              <Link href="/games" className="mt-5 block w-full rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-4 py-3 text-center text-sm font-black text-slate-950">
                {t("playGamesNow")}
              </Link>
            </div>
          </div>
        </section>

        {!listQuery.isPending && !boardQuery.data && (
          <p className="text-center text-sm text-slate-400">
            {t("leaderboardUnavailable")}
          </p>
        )}
      </div>
    </main>
    </>
  );
}
