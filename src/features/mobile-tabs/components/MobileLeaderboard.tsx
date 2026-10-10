"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, type Messages } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, MapPin, Triangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { MobileNotificationBell } from "@/features/mobile-home/components/MobileHomeHeader";
import { getLeaderboard, listLeaderboards, type LeaderboardItemDto } from "@/lib/api/leaderboards";
import { useFormats } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import { MobileSubpageHeader } from "./MobileSubpageHeader";
import { MobileGameListSkeleton, MobileMessage } from "./MobileTabUi";

const SCOPES = [
  { label: "global", type: "ALL_TIME" },
  { label: "weekly", type: "WEEKLY" },
  { label: "monthly", type: "MONTHLY" },
] as const satisfies readonly ({ label: keyof Messages["Gamification"] } & Record<string, unknown>)[];

const PLACE_COLORS = { 1: "#ffc83d", 2: "#c0c6d4", 3: "#d08a4e" } as Record<number, string>;

export type GamificationTranslator = (
  key: keyof Messages["Gamification"],
  values?: Record<string, string | number>,
) => string;

export function leaderboardName(item: LeaderboardItemDto, fallback: string) {
  return item.user.displayName || item.user.username || fallback;
}

export function leaderboardSubtitle(t: GamificationTranslator, item: LeaderboardItemDto) {
  return item.user.level != null
    ? t("levelShortValue", { level: item.user.level })
    : t("gamesPlayedCount", { count: item.gamesPlayed });
}

/** Mirrors the app's Leaderboard screen: scope tabs, podium, rank rows and docked "my rank" bar. */
export function MobileLeaderboard() {
  const { accessToken } = useAuth();
  const signedIn = Boolean(accessToken);
  const [scope, setScope] = useState(0);
  const { timeUntil } = useFormats();
  const t = useTranslations("Gamification");
  const tCommon = useTranslations("Common");
  const tNav = useTranslations("Nav");

  const listQuery = useQuery({
    queryKey: ["leaderboards", "list"],
    queryFn: async () => (await listLeaderboards()).data ?? [],
  });
  const code = listQuery.data?.find((board) => board.type === SCOPES[scope]!.type)?.code;

  const boardQuery = useQuery({
    queryKey: ["leaderboards", code],
    queryFn: async () => (await getLeaderboard(code!, 50)).data!,
    enabled: Boolean(code),
  });

  const data = boardQuery.data;
  const items = data?.items ?? [];
  const me = data?.me ?? null;
  const remaining =
    SCOPES[scope]!.type === "ALL_TIME"
      ? ""
      : timeUntil(data?.leaderboard.period?.endAt);
  const loading = listQuery.isPending || (Boolean(code) && boardQuery.isPending);
  const failed = listQuery.isError || boardQuery.isError;

  return (
    <div className="pb-24">
      <MobileSubpageHeader title={tNav("leaderboard")} action={<MobileNotificationBell />} />

      <div role="tablist" aria-label={t("leaderboardScope")} className="flex gap-2.5 pb-2 pt-1">
        {SCOPES.map((item, index) => {
          const selected = index === scope;
          return (
            <button
              key={item.type}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setScope(index)}
              className={cn(
                "h-11 flex-1 rounded-2xl border text-sm font-extrabold transition-colors",
                selected
                  ? "border-[#ffc83d] bg-gradient-to-b from-[#ffd866] to-[#ffc83d] text-[#1a1205] shadow-[0_0_14px_rgba(255,200,61,0.35)]"
                  : "border-[#2a2a37] bg-[#15151d] text-[#9c9cb0]",
              )}
            >
              {t(item.label)}
            </button>
          );
        })}
      </div>

      {failed ? (
        <div className="rounded-[18px] border border-[#ff5d73]/40 bg-[#15151d] p-4">
          <p className="text-sm text-[#9c9cb0]">{tCommon("errorGeneric")}</p>
          <button
            type="button"
            onClick={() => {
              void listQuery.refetch();
              if (code) void boardQuery.refetch();
            }}
            className="mt-2 text-sm font-bold text-[#ffc83d]"
          >
            {tCommon("retry")}
          </button>
        </div>
      ) : loading ? (
        <MobileGameListSkeleton count={5} />
      ) : items.length === 0 ? (
        <MobileMessage
          icon={BarChart3}
          title={t("noRankingsTitle")}
          message={t("noRankingsMessage")}
        />
      ) : (
        <div className="pt-1">
          {remaining ? (
            <p className="text-center text-xs text-[#9c9cb0]">{t("seasonEndsIn", { time: remaining })}</p>
          ) : null}
          <Podium entries={items.slice(0, 3)} />
          <ul className="mt-5 space-y-2.5">
            {items.slice(3).map((item) => (
              <li key={`${item.user.id}-${item.rank}`}>
                <RankRow entry={item} isMe={item.user.id === me?.user.id} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 bg-[#0b0b10] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto max-w-xl">
          {me ? (
            <RankRow entry={me} isMe docked />
          ) : (
            <div className="flex items-center gap-2.5 rounded-2xl border border-[#2a2a37] bg-[#15151d] px-3.5 py-1.5">
              <MapPin className="size-6 shrink-0 text-[#ffc83d]" aria-hidden="true" />
              <p className="flex-1 py-2.5 text-sm text-[#9c9cb0]">
                {signedIn ? t("playToRank") : t("signInToRank")}
              </p>
              {!signedIn ? (
                <Link href="/login" className="px-2 py-2 text-sm font-bold text-[#ffc83d]">
                  {tCommon("signIn")}
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RingedAvatar({
  entry,
  size,
  color,
  glow = 0,
}: {
  entry: LeaderboardItemDto;
  size: number;
  color: string;
  glow?: number;
}) {
  const fallbackName = useTranslations("Profile")("defaultName");
  const name = leaderboardName(entry, fallbackName);
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{
        padding: size > 60 ? 4 : 2.5,
        background: `linear-gradient(to bottom, color-mix(in srgb, ${color} 55%, white), ${color})`,
        boxShadow: glow > 0 ? `0 0 ${size * 0.3}px color-mix(in srgb, ${color} ${glow * 100}%, transparent)` : undefined,
      }}
    >
      <Avatar style={{ width: size, height: size }}>
        {entry.user.avatarUrl ? <AvatarImage src={entry.user.avatarUrl} alt="" /> : null}
        <AvatarFallback
          className="bg-[#1e1e29] font-extrabold text-white"
          style={{ fontSize: size * 0.36 }}
        >
          {name.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </span>
  );
}

function PlaceBadge({ place }: { place: number }) {
  const color = PLACE_COLORS[place]!;
  const size = place === 1 ? 36 : 30;
  return (
    <span
      className="grid place-items-center rounded-full border-[3px] border-[#0b0b10] font-black text-[#1a1205]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        background: `linear-gradient(to bottom, color-mix(in srgb, ${color} 65%, white), ${color})`,
      }}
    >
      {place}
    </span>
  );
}

function Crest() {
  return (
    <svg
      viewBox="0 0 132 150"
      aria-hidden="true"
      className="absolute left-1/2 top-0 h-[150px] w-[132px] -translate-x-1/2"
      style={{ filter: "drop-shadow(0 0 14px rgba(255,200,61,0.45))" }}
    >
      <defs>
        <linearGradient id="podium-crest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a6" />
          <stop offset="0.5" stopColor="#ffc83d" />
          <stop offset="1" stopColor="#9a6410" />
        </linearGradient>
      </defs>
      <path
        d="M66 8 L81.84 18.24 L118.8 23.36 Q132 65.6 108.24 110.4 L66 136 L23.76 110.4 Q0 65.6 13.2 23.36 L50.16 18.24 Z"
        fill="url(#podium-crest)"
        stroke="#fff1c2"
        strokeWidth="2"
      />
      {[
        [44.88, 10],
        [66, 0],
        [87.12, 10],
      ].map(([cx, peak]) => (
        <path key={cx} d={`M${cx! - 6} 20 L${cx} ${peak} L${cx! + 6} 20 Z`} fill="#ffe08a" />
      ))}
    </svg>
  );
}

function Podium({ entries }: { entries: LeaderboardItemDto[] }) {
  const { grouped } = useFormats();
  const t = useTranslations("Gamification");
  const fallbackName = useTranslations("Profile")("defaultName");
  const spots = [
    { entry: entries[1], place: 2 },
    { entry: entries[0], place: 1 },
    { entry: entries[2], place: 3 },
  ];

  return (
    <div className="mt-2 grid grid-cols-[3fr_4fr_3fr] items-start">
      {spots.map(({ entry, place }) => {
        if (!entry) return <div key={place} />;
        const first = place === 1;
        const color = PLACE_COLORS[place]!;
        const name = leaderboardName(entry, fallbackName);
        return (
          <div
            key={place}
            role="group"
            aria-label={t("podiumLabel", { rank: place, name, score: grouped.format(entry.score) })}
            className={cn("flex min-w-0 flex-col items-center text-center", !first && "pt-11")}
          >
            <div className={cn("relative w-full", first ? "h-[150px]" : "h-[100px]")} aria-hidden="true">
              {first ? <Crest /> : null}
              <span className={cn("absolute left-1/2 -translate-x-1/2", first ? "top-[26px]" : "top-1")}>
                <RingedAvatar entry={entry} size={first ? 92 : 72} color={color} glow={first ? 0.6 : 0.35} />
              </span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <PlaceBadge place={place} />
              </span>
            </div>
            <p
              aria-hidden="true"
              className={cn("mt-1.5 w-full truncate px-1 font-extrabold text-white", first ? "text-base" : "text-sm")}
            >
              {name}
            </p>
            <p aria-hidden="true" className="mt-0.5 w-full truncate text-[13px] font-semibold text-[#9c9cb0]">
              {t("xpAmount", { xp: grouped.format(entry.score) })}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function RankRow({
  entry,
  isMe = false,
  docked = false,
}: {
  entry: LeaderboardItemDto;
  isMe?: boolean;
  docked?: boolean;
}) {
  const t = useTranslations("Gamification");
  const fallbackName = useTranslations("Profile")("defaultName");
  const name = isMe ? t("you") : leaderboardName(entry, fallbackName);
  const subtitle = leaderboardSubtitle(t, entry);
  const change = entry.rankChange ?? 0;
  const { grouped } = useFormats();
  const score = grouped.format(entry.score);

  return (
    <div
      role="group"
      aria-label={t("rowLabel", { rank: entry.rank, name, detail: subtitle, score })}
      className={cn(
        "flex items-center rounded-2xl border px-3.5 py-2.5",
        docked
          ? "border-[#ffc83d] bg-gradient-to-r from-[#ffd866] to-[#ffc83d] text-[#1a1205] shadow-[0_0_18px_rgba(255,200,61,0.35)]"
          : cn(
              "bg-gradient-to-br from-[#1a1d26] to-[#12141b] text-white",
              isMe ? "border-[#ffc83d]/70" : "border-[#2a2a37]",
            ),
      )}
    >
      <span aria-hidden="true" className={cn("min-w-9 font-black", docked ? "text-base" : "text-lg")}>
        {docked ? `#${entry.rank}` : entry.rank}
      </span>
      <span aria-hidden="true" className="ml-1.5">
        <RingedAvatar entry={entry} size={42} color={docked ? "#1a1205" : "#ffc83d"} />
      </span>
      <span aria-hidden="true" className="ml-3 min-w-0 flex-1">
        <span className="block truncate text-base font-extrabold">{name}</span>
        <span className={cn("block truncate text-[13px]", docked ? "text-[#1a1205]/75" : "text-[#9c9cb0]")}>
          {subtitle}
        </span>
      </span>
      {change !== 0 ? (
        <span
          aria-hidden="true"
          className={cn(
            "mr-2.5 flex items-center gap-0.5 text-xs font-bold",
            docked ? "text-[#1a1205]" : change > 0 ? "text-[#2bd576]" : "text-[#ff5d73]",
          )}
        >
          <Triangle className={cn("size-2.5 fill-current", change < 0 && "rotate-180")} />
          {Math.abs(change)}
        </span>
      ) : null}
      <span aria-hidden="true" className="max-w-28 truncate text-right text-base font-black">
        {t("xpAmount", { xp: score })}
      </span>
    </div>
  );
}
