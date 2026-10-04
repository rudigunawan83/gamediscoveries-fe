"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { GameGrid } from "@/components/game/GameGrid";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import { gamesQueryOptions } from "@/features/games/queries/gameQueries";

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const normalized = query.trim();
  const enabled = normalized.length > 0;

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    ...gamesQueryOptions({
      page: 1,
      pageSize: 48,
      search: normalized,
      sort: "newest",
    }),
    enabled,
  });

  if (!enabled) {
    return (
      <EmptyState
        title="Start searching"
        description="Try racing, puzzle, multiplayer, or a game title."
      />
    );
  }

  if (isPending) {
    return <SectionSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Search failed to load."
        description="We couldn’t reach the catalog. Please try again."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const games = data ?? [];

  if (games.length === 0) {
    return (
      <EmptyState
        title="No games found"
        description={`Nothing matched “${normalized}”. Try another genre, tag, or title.`}
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {isFetching ? "Updating results…" : `${games.length} result${games.length === 1 ? "" : "s"} for “${normalized}”`}
      </p>
      <GameGrid games={games} />
    </div>
  );
}
