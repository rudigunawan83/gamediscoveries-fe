"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/common/ErrorState";
import { GameSection } from "@/components/game/GameSection";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import { gamesQueryOptions } from "@/features/games/queries/gameQueries";

interface GamesCatalogProps {
  category?: string;
  search?: string;
}

export function GamesCatalog({ category, search }: GamesCatalogProps) {
  const t = useTranslations("Discovery");
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
        title={t("loadErrorTitle")}
        description={t("catalogErrorDescription")}
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
        <p className="mb-3 text-xs text-muted-foreground">{t("catalogRefreshing")}</p>
      ) : null}
      <GameSection
        title={t("newestTitle")}
        description={t("newestDescription", { count: games.length })}
        games={games}
        variant="discovery"
      />
    </div>
  );
}
