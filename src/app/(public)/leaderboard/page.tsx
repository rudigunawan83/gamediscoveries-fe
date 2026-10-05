"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { analytics } from "@/lib/analytics/client";
import {
  getLeaderboard,
  getMyLeaderboardRank,
  listLeaderboards,
  type LeaderboardItemDto,
} from "@/lib/api/leaderboards";

const BOARDS = [
  { code: "GLOBAL_WEEKLY_XP", label: "Weekly" },
  { code: "GLOBAL_MONTHLY_XP", label: "Monthly" },
  { code: "GLOBAL_ALL_TIME_XP", label: "All Time" },
] as const;

function formatMovement(movement?: string | null) {
  if (!movement || movement === "SAME") return "—";
  if (movement === "NEW") return "NEW";
  if (movement.startsWith("UP_")) return `↑ ${movement.slice(3)}`;
  if (movement.startsWith("DOWN_")) return `↓ ${movement.slice(5)}`;
  return movement;
}

function countdown(endAt?: string | null) {
  if (!endAt) return null;
  const ms = new Date(endAt).getTime() - Date.now();
  if (ms <= 0) return "Period ending…";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${d}d ${h}h ${m}m`;
}

function Podium({ items }: { items: LeaderboardItemDto[] }) {
  const first = items.find((i) => i.rank === 1);
  const second = items.find((i) => i.rank === 2);
  const third = items.find((i) => i.rank === 3);
  const slot = (item: LeaderboardItemDto | undefined, place: string, height: string) => (
    <div className={`flex flex-1 flex-col items-center justify-end ${height}`}>
      <div className="mb-2 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{place}</p>
        <p className="font-display text-lg font-bold text-white">
          {item?.user.displayName || item?.user.username || "—"}
        </p>
        <p className="text-sm text-amber-300">
          {item ? `${item.score.toLocaleString()} XP` : ""}
        </p>
      </div>
      <div className="w-full rounded-t-xl border border-white/10 bg-gradient-to-b from-white/15 to-white/5 py-6" />
    </div>
  );

  return (
    <div className="flex items-end gap-3">
      {slot(second, "2nd", "min-h-[140px]")}
      {slot(first, "1st", "min-h-[180px]")}
      {slot(third, "3rd", "min-h-[120px]")}
    </div>
  );
}

export default function LeaderboardPage() {
  const { accessToken } = useAuth();
  const [code, setCode] = useState<string>("GLOBAL_WEEKLY_XP");

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
    () => countdown(boardQuery.data?.leaderboard.period?.endAt),
    [boardQuery.data?.leaderboard.period?.endAt],
  );

  const items = boardQuery.data?.items ?? [];
  const me = meQuery.data;

  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="space-y-2 text-center">
        <h1 className="font-display text-4xl font-bold text-white">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Compete with XP earned from real play, missions, and achievements.
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-2">
        {BOARDS.map((b) => (
          <button
            key={b.code}
            type="button"
            onClick={() => setCode(b.code)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              code === b.code
                ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
                : "border-white/10 bg-white/5 text-muted-foreground"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              {boardQuery.data?.leaderboard.name ?? "Weekly XP"}
            </h2>
            {endsIn && code !== "GLOBAL_ALL_TIME_XP" && (
              <p className="text-sm text-muted-foreground">Ends in {endsIn}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {boardQuery.data?.totalParticipants ?? 0} players
          </p>
        </div>

        {boardQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading ranks…</p>
        ) : (
          <>
            <Podium items={items.slice(0, 3)} />
            <ul className="mt-6 space-y-2">
              {items.map((item) => (
                <li
                  key={`${item.user.id}-${item.rank}`}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 font-display text-lg font-bold text-white">
                      #{item.rank}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.user.displayName || item.user.username || "Player"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.gamesPlayed} games · {formatMovement(item.rankMovement)}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-amber-300">
                    {item.score.toLocaleString()} XP
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {accessToken && me && (
        <section className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
          <p className="text-xs uppercase tracking-wide text-amber-200/80">Your rank</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-3xl font-bold text-white">
                {me.rank != null ? `#${me.rank}` : "Unranked"}
              </p>
              <p className="text-sm text-muted-foreground">
                {me.score.toLocaleString()} XP · {formatMovement(me.rankMovement)}
                {me.percentile != null
                  ? ` · Better than ${me.percentile}% of players`
                  : ""}
              </p>
            </div>
            {me.nextRank != null && me.xpToNextRank != null && (
              <p className="text-sm text-amber-100">
                You&apos;re {me.xpToNextRank.toLocaleString()} XP away from #{me.nextRank}
              </p>
            )}
          </div>
          {me.rank == null && (
            <p className="mt-2 text-sm text-muted-foreground">
              Keep playing to climb the board — earn XP from sessions, missions, and streaks.
            </p>
          )}
        </section>
      )}

      {!listQuery.isPending && !boardQuery.data && (
        <p className="text-center text-sm text-muted-foreground">
          Leaderboard is temporarily unavailable.
        </p>
      )}
    </div>
  );
}
