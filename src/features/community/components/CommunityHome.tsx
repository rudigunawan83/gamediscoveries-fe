"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronRight, Edit3, Gamepad2, Trophy, Users } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getCommunityHome,
  type CommunityGame,
  type CommunityHome as CommunityHomeDto,
  type CommunityPostSort,
} from "@/lib/api/community";
import { analytics } from "@/lib/analytics/client";
import { CommunityPostFeed } from "@/features/mobile-tabs/components/MobileCommunity";
import { CommunityComposer, useSignInPrompt } from "@/features/mobile-tabs/components/MobileCommunityUi";

const FEED_SORTS = [
  ["latest", "sortLatest"],
  ["trending", "sortTrending"],
  ["most_liked", "sortMostLiked"],
] as const satisfies readonly (readonly [CommunityPostSort, string])[];

function initials(name?: string | null) {
  return (name || "U")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function Avatar({ name, index, size = "md" }: { name?: string | null; index: number; size?: "sm" | "md" | "lg" }) {
  const sizes = size === "lg" ? "h-20 w-20 text-2xl" : size === "sm" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm";
  const tones = [
    "from-amber-300 via-orange-400 to-rose-500",
    "from-sky-300 via-cyan-400 to-blue-700",
    "from-pink-300 via-fuchsia-400 to-purple-700",
    "from-emerald-300 via-teal-400 to-cyan-700",
  ];
  return (
    <div className={`${sizes} mx-auto grid shrink-0 place-items-center rounded-full border-2 border-white/20 bg-gradient-to-br ${tones[index % tones.length]} font-display font-black text-slate-950 shadow-xl shadow-black/25`}>
      {initials(name)}
    </div>
  );
}

function GameThumb({ game }: { game: CommunityGame }) {
  return (
    <div
      className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-sky-400 to-indigo-800"
      style={game.thumbnailUrl ? { backgroundImage: `url(${game.thumbnailUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    />
  );
}

function Spotlight({ players }: { players: CommunityHomeDto["topPlayers"] }) {
  const locale = useLocale();
  const t = useTranslations("Community");
  const tCommon = useTranslations("Common");
  const ranked = [...players].sort((a, b) => a.rank - b.rank).slice(0, 3);
  const podium = ranked.length === 3 ? [ranked[1], ranked[0], ranked[2]] : ranked;

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-black text-white">
          <Trophy className="h-5 w-5 text-amber-300" /> {t("spotlight")}
        </h2>
        <Link href="/community/leaderboards" className="text-xs font-bold text-amber-200">{tCommon("viewAll")}</Link>
      </div>
      <div className={`grid items-end gap-3 text-center ${podium.length === 3 ? "grid-cols-3" : "grid-cols-1"}`}>
        {podium.map((player) => {
          const leader = player.rank === 1;
          return (
            <div key={player.userId} className={podium.length === 3 && !leader ? "mt-4" : ""}>
              <Avatar name={player.displayName || player.username} index={player.rank} size={leader ? "lg" : "md"} />
              <p className="mt-3 truncate text-sm font-black text-white">{player.displayName || player.username}</p>
              <p className="text-xs text-slate-400">{t("points", { points: player.score.toLocaleString(locale) })}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ActiveChallenges({ challenges }: { challenges: CommunityHomeDto["activeChallenges"] }) {
  const t = useTranslations("Community");
  const tCommon = useTranslations("Common");
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-black text-white">
          <CalendarDays className="h-5 w-5 text-violet-300" /> {t("challengesTitle")}
        </h2>
        <Link href="/community/challenges" className="text-xs font-bold text-amber-200">{tCommon("viewAll")}</Link>
      </div>
      <div className="space-y-3">
        {challenges.slice(0, 3).map((challenge) => (
          <Link key={challenge.id} href="/community/challenges" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 hover:border-amber-300/30">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-800">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">{challenge.title}</p>
              <p className="line-clamp-1 text-xs text-slate-400">{challenge.description}</p>
              <p className="mt-1 text-xs text-slate-500">
                {t(challenge.completed ? "challengeProgressDone" : "challengeProgress", {
                  current: challenge.progress,
                  target: challenge.targetValue,
                })}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function PopularGames({ games }: { games: CommunityGame[] }) {
  const t = useTranslations("Community");
  const tCommon = useTranslations("Common");
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-black text-white">
          <Gamepad2 className="h-5 w-5 text-sky-300" /> {t("popularGames")}
        </h2>
        <Link href="/games" className="text-xs font-bold text-amber-200">{tCommon("viewAll")}</Link>
      </div>
      <ol className="space-y-3">
        {games.slice(0, 5).map((game, index) => (
          <li key={game.id}>
            <Link href={`/game/${game.slug}/community`} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl p-2 hover:bg-white/[0.04]">
              <span className="font-display text-2xl font-black text-white">{index + 1}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">{game.title}</p>
                {game.categories?.[0] ? <p className="truncate text-xs text-slate-500">{game.categories[0]}</p> : null}
              </div>
              <GameThumb game={game} />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CommunityHome() {
  const [sort, setSort] = useState<CommunityPostSort>("latest");
  const [composerOpen, setComposerOpen] = useState(false);
  const { accessToken } = useAuth();
  const promptSignIn = useSignInPrompt();
  const t = useTranslations("Community");
  const tNav = useTranslations("Nav");
  const { data } = useQuery({
    queryKey: ["community", "home"],
    queryFn: async () => (await getCommunityHome()).data,
    staleTime: 30_000,
  });

  useEffect(() => {
    analytics.track("community_viewed", { source: "community_home" });
  }, []);

  const openComposer = () => {
    if (!accessToken) promptSignIn(t("signInToPost"));
    else setComposerOpen(true);
  };

  const topPlayers = data?.topPlayers ?? [];
  const challenges = data?.activeChallenges ?? [];
  const popularGames = data?.popularGames ?? [];
  const hasSidebar = topPlayers.length > 0 || challenges.length > 0 || popularGames.length > 0;

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 text-white">
      <section
        className="relative min-h-[220px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 shadow-2xl shadow-black/30 sm:min-h-[250px]"
        style={{
          backgroundImage: "url('/images/community-hero.jpg')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/78 to-slate-950/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        <div className="relative flex min-h-[220px] flex-col justify-end p-5 sm:min-h-[250px] sm:p-7">
          <div className="max-w-xl">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-amber-200">
              <Users className="h-4 w-4" /> {tNav("community")}
            </p>
            <h1 className="font-display text-3xl font-black leading-none text-white sm:text-5xl">
              {t.rich("heroTitle", {
                highlight: (chunks) => <span className="text-amber-300">{chunks}</span>,
              })}
            </h1>
            <p className="mt-4 max-w-md text-xs leading-5 text-slate-200 sm:text-sm sm:leading-6">
              {t("heroDescription")}
            </p>
          </div>
          <button
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-400 px-5 py-3 text-xs font-black text-slate-950 shadow-xl shadow-amber-950/30 transition hover:scale-[1.02] sm:absolute sm:bottom-7 sm:right-7 sm:mt-0"
            type="button"
            onClick={openComposer}
          >
            <Edit3 className="h-4 w-4" /> {t("createPost")}
          </button>
        </div>
      </section>

      <section className={`grid gap-5 ${hasSidebar ? "lg:grid-cols-[1fr_340px]" : ""}`}>
        <main className="space-y-4">
          <div
            role="tablist"
            aria-label={t("sortLabel")}
            className="flex flex-wrap gap-2 rounded-[1.5rem] border border-white/10 bg-slate-950/75 p-2"
          >
            {FEED_SORTS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={sort === value}
                onClick={() => setSort(value)}
                className={`rounded-2xl px-5 py-2.5 text-sm font-black ${
                  sort === value
                    ? "bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950"
                    : "text-slate-400 hover:bg-white/[0.05]"
                }`}
              >
                {t(label)}
              </button>
            ))}
          </div>
          <CommunityPostFeed key={sort} sort={sort} />
        </main>

        {hasSidebar ? (
          <aside className="space-y-5">
            {topPlayers.length > 0 ? <Spotlight players={topPlayers} /> : null}
            {challenges.length > 0 ? <ActiveChallenges challenges={challenges} /> : null}
            {popularGames.length > 0 ? <PopularGames games={popularGames} /> : null}
          </aside>
        ) : null}
      </section>

      <CommunityComposer open={composerOpen} onClose={() => setComposerOpen(false)} />
    </div>
  );
}
