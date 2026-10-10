"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ContinuePlaying } from "@/features/my-games/components/ContinuePlaying";
import { EmptyMyGames } from "@/features/my-games/components/EmptyMyGames";
import { FavoritesSection } from "@/features/my-games/components/FavoritesSection";
import { HistorySection } from "@/features/my-games/components/HistorySection";
import { MyGamesTabs } from "@/features/my-games/components/MyGamesTabs";
import { useMyGamesOverview } from "@/features/my-games/hooks/useMyGames";
import { parseMyGamesTab } from "@/features/my-games/utils/myGamesTabs";
import { BecauseYouPlayedSection } from "@/features/recommendations/components/RecommendationSection";
import { analytics } from "@/lib/analytics/client";

export function MyGamesPage() {
  const t = useTranslations("Library");
  const tNav = useTranslations("Nav");
  const searchParams = useSearchParams();
  const activeTab = parseMyGamesTab(searchParams.get("tab"));
  const overview = useMyGamesOverview();
  const trackedTab = useRef<string | null>(null);

  useEffect(() => {
    if (trackedTab.current === activeTab) return;
    trackedTab.current = activeTab;

    if (activeTab === "favorites") {
      analytics.track("favorites_viewed", { source: "my_games" });
    } else if (activeTab === "history") {
      analytics.track("history_viewed", { source: "my_games" });
    } else {
      analytics.track("my_games_viewed", { source: "my_games" });
    }
  }, [activeTab]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
          {tNav("myGames")}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          {t("myGamesSubtitle")}
        </p>
      </header>

      <MyGamesTabs activeTab={activeTab} />

      {activeTab === "all" ? (
        overview.isEmpty ? (
          <EmptyMyGames />
        ) : (
          <div className="space-y-10">
            <ContinuePlaying items={overview.continuePlaying} />
            <BecauseYouPlayedSection />
            <HistorySection preview />
            <FavoritesSection preview />
          </div>
        )
      ) : null}

      {activeTab === "favorites" ? <FavoritesSection /> : null}
      {activeTab === "history" ? <HistorySection /> : null}
    </div>
  );
}
