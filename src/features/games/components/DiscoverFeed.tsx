"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/common/ErrorState";
import { GameSection } from "@/components/game/GameSection";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { ApiClientError } from "@/lib/api/types";

export function DiscoverFeed() {
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
        title="Discoveries failed to load."
        description="We couldn't load personalized discovery feeds. Please try again."
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
      <GameSection
        title="Today's Discoveries"
        description="Hand-picked picks from the live catalog."
        games={todaysDiscoveries.slice(0, 12)}
        href="/games"
        variant="discovery"
      />
      <GameSection
        title="Most Popular"
        description="Top games players love right now."
        games={data.popular.slice(0, 12)}
        href="/most-popular"
        variant="discovery"
      />
      <GameSection
        title="Hot Games"
        description="Fresh heat from the GameMonetize hot feed."
        games={data.hotGames.slice(0, 12)}
        href="/hot-games"
        variant="discovery"
      />
      <GameSection
        title="Best Games"
        description="Editor-grade favorites and standout titles."
        games={data.bestGames.slice(0, 12)}
        href="/best-games"
        variant="discovery"
      />
      <GameSection
        title="Most Played"
        description="High-engagement games with strong replay value."
        games={data.mostPlayed.slice(0, 12)}
        href="/most-played"
        variant="discovery"
      />
      <GameSection
        title="Exclusive Games"
        description="Exclusive-style classics and match gems like Zuma vibes."
        games={data.exclusiveGames.slice(0, 12)}
        href="/exclusive-games"
        variant="discovery"
      />
      <GameSection
        title="Trending Now"
        games={data.trending.slice(0, 12)}
        href="/trending"
        variant="discovery"
      />
      <GameSection
        title="New Games"
        games={data.latest.slice(0, 12)}
        href="/new"
        variant="discovery"
      />
      <GameSection
        title="Mobile Ready"
        games={data.mobile.slice(0, 12)}
        href="/mobile"
        variant="discovery"
      />
      <GameSection
        title="Multiplayer"
        games={data.multiplayer.slice(0, 12)}
        href="/multiplayer"
        variant="discovery"
      />
    </div>
  );
}
