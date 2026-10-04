"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GameGridSkeleton } from "@/components/game/GameGridSkeleton";
import { EmptyFavorites } from "@/features/my-games/components/EmptyFavorites";
import { LibraryErrorState } from "@/features/my-games/components/LibraryErrorState";
import { LibraryGameGrid } from "@/features/my-games/components/LibraryGameGrid";
import { fetchFavorites } from "@/features/my-games/api/favoritesApi";
import { useFavorites } from "@/features/my-games/hooks/useFavorites";
import type { FavoriteItem } from "@/features/my-games/types/my-games.types";
import { mapLibraryError } from "@/features/my-games/utils/libraryErrors";

type FavoritesSectionProps = {
  preview?: boolean;
  showHeader?: boolean;
};

export function FavoritesSection({
  preview = false,
  showHeader = true,
}: FavoritesSectionProps) {
  const pageSize = preview ? 6 : 24;
  const query = useFavorites({ page: 1, pageSize });
  const [extraItems, setExtraItems] = useState<FavoriteItem[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreOverride, setHasMoreOverride] = useState<boolean | null>(null);

  useEffect(() => {
    setExtraItems([]);
    setPage(1);
    setHasMoreOverride(null);
  }, [query.dataUpdatedAt]);

  const baseItems = query.data?.items ?? [];
  const items = [...baseItems, ...extraItems];
  const hasMore =
    hasMoreOverride ?? Boolean(query.data?.hasMore && page === 1);

  if (query.isPending) {
    return (
      <section className="space-y-4" aria-busy="true" aria-label="Loading favorites">
        {showHeader ? (
          <h2 className="font-display text-xl font-semibold text-white">Favorites</h2>
        ) : null}
        <GameGridSkeleton />
      </section>
    );
  }

  if (query.isError) {
    return (
      <section className="space-y-4">
        {showHeader ? (
          <h2 className="font-display text-xl font-semibold text-white">Favorites</h2>
        ) : null}
        <LibraryErrorState
          message={mapLibraryError(query.error, "Unable to load your favorites.")}
          onRetry={() => {
            void query.refetch();
          }}
        />
      </section>
    );
  }

  if (items.length === 0) {
    return preview ? null : <EmptyFavorites />;
  }

  return (
    <section className="space-y-4" aria-labelledby="favorites-section-title">
      {showHeader ? (
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2
              id="favorites-section-title"
              className="font-display text-xl font-semibold text-white"
            >
              Favorites
            </h2>
            <p className="text-sm text-muted-foreground">
              Games you saved for quick access.
            </p>
          </div>
          {preview ? (
            <Link
              href="/my-games?tab=favorites"
              className="text-sm font-medium text-primary hover:underline"
            >
              View All Favorites
            </Link>
          ) : null}
        </div>
      ) : null}
      <LibraryGameGrid
        games={items.map((item) => item.game)}
        source="favorites"
      />
      {!preview && hasMore ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={loadingMore}
            onClick={() => {
              void (async () => {
                setLoadingMore(true);
                try {
                  const nextPage = page + 1;
                  const result = await fetchFavorites({
                    page: nextPage,
                    pageSize,
                  });
                  setExtraItems((prev) => [...prev, ...result.items]);
                  setPage(nextPage);
                  setHasMoreOverride(result.hasMore);
                } finally {
                  setLoadingMore(false);
                }
              })();
            }}
          >
            {loadingMore ? "Loading…" : "Load More"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
