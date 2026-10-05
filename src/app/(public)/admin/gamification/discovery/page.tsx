"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getAdminDiscoveryConfig,
  getAdminDiscoveryOverview,
  getAdminDiscoveryRankings,
  recalculateDiscoveryScores,
  trendBadge,
} from "@/lib/api/discovery-rankings";

export default function AdminDiscoveryPage() {
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();
  const roles = user?.roles ?? [];
  const canView = roles.some((r) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(r),
  );
  const isSuperAdmin = roles.includes("SuperAdmin");
  const [type, setType] = useState("TRENDING");

  const overviewQuery = useQuery({
    queryKey: ["admin", "discovery", "overview"],
    queryFn: async () => (await getAdminDiscoveryOverview()).data!,
    enabled: Boolean(accessToken && canView),
  });

  const configQuery = useQuery({
    queryKey: ["admin", "discovery", "config"],
    queryFn: async () => (await getAdminDiscoveryConfig()).data!,
    enabled: Boolean(accessToken && canView),
  });

  const rankingsQuery = useQuery({
    queryKey: ["admin", "discovery", "rankings", type],
    queryFn: async () => (await getAdminDiscoveryRankings(type, 40)).data!,
    enabled: Boolean(accessToken && canView),
  });

  const recalcMutation = useMutation({
    mutationFn: () => recalculateDiscoveryScores(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "discovery"] });
    },
  });

  if (!accessToken || !canView) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary">
          Sign in
        </Link>{" "}
        as admin to manage discovery rankings.
      </p>
    );
  }

  const overview = overviewQuery.data;
  const config = configQuery.data;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Discovery Score
          </h1>
          <p className="text-sm text-muted-foreground">
            Global ranking engine — score version {overview?.scoreVersion ?? "—"}
          </p>
        </div>
        {isSuperAdmin ? (
          <Button
            size="sm"
            disabled={recalcMutation.isPending}
            onClick={() => recalcMutation.mutate()}
          >
            {recalcMutation.isPending ? "Recalculating…" : "Recalculate now"}
          </Button>
        ) : null}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Scored games", overview?.scoredGames],
          ["Avg discovery", overview?.averageDiscoveryScore],
          ["Avg trending", overview?.averageTrendingScore],
          ["Rising", overview?.risingGames],
          ["Hot", overview?.hotGames],
          ["Declining", overview?.decliningGames],
          ["New", overview?.newGames],
          [
            "Last run",
            overview?.lastCalculatedAt
              ? new Date(overview.lastCalculatedAt).toLocaleString()
              : "—",
          ],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-xl font-bold text-white">
              {value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {config ? (
        <section className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
          <h2 className="font-display text-lg font-semibold text-white">
            Active weights (v{config.scoreVersion})
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Popularity", config.popularityWeight],
              ["Engagement", config.engagementWeight],
              ["Quality", config.qualityWeight],
              ["Momentum", config.momentumWeight],
              ["Growth", config.growthWeight],
              ["Freshness", config.freshnessWeight],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-white">{Number(value).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {[
          "TRENDING",
          "RISING",
          "POPULAR",
          "NEW_TRENDING",
          "MOST_PLAYED",
          "MOST_FAVORITED",
        ].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-lg border px-3 py-1.5 text-xs ${
              type === t
                ? "border-amber-400/50 bg-amber-400/15 text-white"
                : "border-white/10 bg-white/5 text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Rank</th>
              <th className="px-3 py-2">Game</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Trend</th>
              <th className="px-3 py-2">Δ Rank</th>
              <th className="px-3 py-2">Growth %</th>
            </tr>
          </thead>
          <tbody>
            {(rankingsQuery.data?.items ?? []).map((item) => (
              <tr key={`${item.rank}-${item.game.id}`} className="border-t border-white/10">
                <td className="px-3 py-2 text-white">#{item.rank}</td>
                <td className="px-3 py-2 text-white">{item.game.title}</td>
                <td className="px-3 py-2 text-white">{item.score.toFixed(1)}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {trendBadge(item.trend)}
                </td>
                <td className="px-3 py-2 text-white">
                  {item.rankChange > 0
                    ? `↑ ${item.rankChange}`
                    : item.rankChange < 0
                      ? `↓ ${Math.abs(item.rankChange)}`
                      : "—"}
                </td>
                <td className="px-3 py-2 text-white">
                  {item.trendPercentage.toFixed(1)}%
                </td>
              </tr>
            ))}
            {(rankingsQuery.data?.items?.length ?? 0) === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  No snapshots yet. Run recalculate after migration.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
