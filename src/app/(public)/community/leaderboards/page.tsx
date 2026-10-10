"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocale, useTranslations, type Messages } from "next-intl";
import { Button } from "@/components/ui/button";
import { getLeaderboards } from "@/lib/api/community";
import { analytics } from "@/lib/analytics/client";

type CommunityKey = keyof Messages["Community"];

const TYPES = [
  ["players", "typePlayers"],
  ["explorers", "typeExplorers"],
  ["reviewers", "typeReviewers"],
  ["contributors", "typeContributors"],
] as const satisfies readonly (readonly [string, CommunityKey])[];

const PERIODS = [
  ["daily", "periodDaily"],
  ["weekly", "periodWeekly"],
  ["monthly", "periodMonthly"],
  ["all", "periodAll"],
] as const satisfies readonly (readonly [string, CommunityKey])[];

export default function LeaderboardsPage() {
  const [type, setType] = useState<string>("players");
  const [period, setPeriod] = useState<string>("weekly");
  const t = useTranslations("Community");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const { data, isPending } = useQuery({
    queryKey: ["community", "leaderboards", type, period],
    queryFn: async () => (await getLeaderboards(type, period)).data ?? [],
  });

  useEffect(() => {
    analytics.track("community_leaderboard_viewed", { type, period });
  }, [type, period]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">
          {t("leaderboardsTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("leaderboardsIntro")}</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {TYPES.map(([value, label]) => (
          <Button
            key={value}
            size="sm"
            variant={type === value ? "default" : "outline"}
            onClick={() => setType(value)}
          >
            {t(label)}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {PERIODS.map(([value, label]) => (
          <Button
            key={value}
            size="sm"
            variant={period === value ? "default" : "outline"}
            onClick={() => setPeriod(value)}
          >
            {t(label)}
          </Button>
        ))}
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
      ) : (
        <ol className="space-y-2">
          {(data as Array<{
            rank: number;
            userId: string;
            username: string;
            displayName?: string | null;
            score: number;
          }>).map((entry) => (
            <li
              key={entry.userId}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            >
              <Link
                href={`/profile/${entry.username}`}
                className="text-white hover:text-primary"
              >
                {entry.rank}. {entry.displayName || entry.username}
              </Link>
              <span className="text-muted-foreground">{entry.score.toLocaleString(locale)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
