"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/common/ErrorState";
import { GameSection } from "@/components/game/GameSection";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import { gamesQueryOptions } from "@/features/games/queries/gameQueries";

interface GamesCatalogProps {
  category?: string;
  search?: string;
}

export function GamesCatalog({ category, search }: GamesCatalogProps) {
  const { data, isPending, isError, refetch, isFetching } = useQuery(
    gamesQueryOptions({
      page: 1,
      pageSize: 500,
      category,
      search,
      sort: "newest",
    }),
  );

  if (isPending) {
    return <SectionSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Games failed to load."
        description="The catalog is temporarily unavailable. Please try again."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const games = data ?? [];

  return (
    <div className="relative">
      {isFetching ? (
        <p className="mb-3 text-xs text-muted-foreground">Refreshing catalog…</p>
      ) : null}
      <GameSection
        title="Newest Games"
        description={`Showing ${games.length} latest games from the live catalog.`}
        games={games}
        variant="discovery"
      />
    </div>
  );
}
