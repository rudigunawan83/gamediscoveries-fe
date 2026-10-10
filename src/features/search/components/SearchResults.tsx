"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { GameGrid } from "@/components/game/GameGrid";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import { gamesQueryOptions } from "@/features/games/queries/gameQueries";

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const t = useTranslations("Search");
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
        title={t("startTitle")}
        description={t("startDescription")}
      />
    );
  }

  if (isPending) {
    return <SectionSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title={t("errorTitle")}
        description={t("errorDescription")}
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
        title={t("noResultsTitle")}
        description={t("noResultsDescription", { query: normalized })}
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {isFetching
          ? t("updating")
          : t("results", { count: games.length, query: normalized })}
      </p>
      <GameGrid games={games} />
    </div>
  );
}
