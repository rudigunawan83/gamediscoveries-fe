"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/common/ErrorState";
import { GameSection } from "@/components/game/GameSection";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { RecommendationHomeShelves } from "@/features/recommendations/components/RecommendationHomeShelves";
import { HiddenGemsSection } from "@/features/recommendations/components/RecommendationSection";
import { ApiClientError } from "@/lib/api/types";

export function DiscoverFeed() {
  const t = useTranslations("Discovery");
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["discoveries", "home", "v2"],
    queryFn: fetchHomeDiscoveries,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiClientError && error.status === 429) {
        return failureCount < 4;
      }
      return failureCount < 2;
    },
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 8_000),
  });

  if (isPending) {
    return (
      <div className="space-y-10 md:space-y-14">
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("feedErrorTitle")}
        description={t("feedErrorDescription")}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const todaysDiscoveries =
    data.featured.length > 0 ? data.featured : data.latest;

  return (
    <div className="space-y-10 md:space-y-14">
      <RecommendationHomeShelves />
      <GameSection
        title={t("todaysTitle")}
        description={t("todaysDescription")}
        games={todaysDiscoveries.slice(0, 12)}
        href="/games"
        variant="discovery"
      />
      <HiddenGemsSection />
      <GameSection
        title={t("popularTitle")}
        description={t("popularDescription")}
        games={data.popular.slice(0, 12)}
        href="/most-popular"
        variant="discovery"
      />
      <GameSection
        title={t("shelfHot")}
        description={t("hotDescription")}
        games={data.hotGames.slice(0, 12)}
        href="/hot-games"
        variant="discovery"
      />
      <GameSection
        title={t("shelfBest")}
        description={t("bestDescription")}
        games={data.bestGames.slice(0, 12)}
        href="/best-games"
        variant="discovery"
      />
      <GameSection
        title={t("shelfMostPlayed")}
        description={t("mostPlayedDescription")}
        games={data.mostPlayed.slice(0, 12)}
        href="/most-played"
        variant="discovery"
      />
      <GameSection
        title={t("exclusiveTitle")}
        description={t("exclusiveDescription")}
        games={data.exclusiveGames.slice(0, 12)}
        href="/exclusive-games"
        variant="discovery"
      />
      <GameSection
        title={t("shelfTrending")}
        games={data.trending.slice(0, 12)}
        href="/trending"
        variant="discovery"
      />
      <GameSection
        title={t("newGamesTitle")}
        games={data.latest.slice(0, 12)}
        href="/new"
        variant="discovery"
      />
      <GameSection
        title={t("mobileReadyTitle")}
        games={data.mobile.slice(0, 12)}
        href="/mobile"
        variant="discovery"
      />
      <GameSection
        title={t("shelfMultiplayer")}
        games={data.multiplayer.slice(0, 12)}
        href="/multiplayer"
        variant="discovery"
      />
    </div>
  );
}
