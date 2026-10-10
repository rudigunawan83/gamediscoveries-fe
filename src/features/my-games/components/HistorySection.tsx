"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { GameGridSkeleton } from "@/components/game/GameGridSkeleton";
import { EmptyHistory } from "@/features/my-games/components/EmptyHistory";
import { LibraryErrorState } from "@/features/my-games/components/LibraryErrorState";
import { LibraryGameGrid } from "@/features/my-games/components/LibraryGameGrid";
import {
  useHistory,
  useHistoryPreview,
} from "@/features/my-games/hooks/useHistory";
import {
  formatHistoryMeta,
  useHistoryFormatter,
} from "@/features/my-games/utils/formatPlayTime";
import { mapLibraryError } from "@/features/my-games/utils/libraryErrors";

type HistorySectionProps = {
  preview?: boolean;
  showHeader?: boolean;
};

export function HistorySection({
  preview = false,
  showHeader = true,
}: HistorySectionProps) {
  const t = useTranslations("Library");
  const tNav = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const fmt = useHistoryFormatter();
  const previewQuery = useHistoryPreview(6);
  const fullQuery = useHistory(24);
  const query = preview ? previewQuery : fullQuery;

  if (query.isPending) {
    return (
      <section className="space-y-4" aria-busy="true" aria-label={t("historyLoading")}>
        {showHeader ? (
          <div>
            <h2 className="font-display text-xl font-semibold text-white">
              {tNav("recentlyPlayed")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("historyDescription")}
            </p>
          </div>
        ) : null}
        <GameGridSkeleton />
      </section>
    );
  }

  if (query.isError) {
    return (
      <section className="space-y-4">
        {showHeader ? (
          <h2 className="font-display text-xl font-semibold text-white">
            {tNav("recentlyPlayed")}
          </h2>
        ) : null}
        <LibraryErrorState
          message={mapLibraryError(
            query.error,
            t,
            t("historyLoadError"),
            tCommon("errorGeneric"),
          )}
          onRetry={() => {
            void query.refetch();
          }}
        />
      </section>
    );
  }

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  if (items.length === 0) {
    return preview ? null : <EmptyHistory />;
  }

  const metaByGameId = Object.fromEntries(
    items.map((item) => [item.gameId, formatHistoryMeta(fmt, item)]),
  );

  return (
    <section className="space-y-4" aria-labelledby="history-section-title">
      {showHeader ? (
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2
              id="history-section-title"
              className="font-display text-xl font-semibold text-white"
            >
              {tNav("recentlyPlayed")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("historyDescription")}
            </p>
          </div>
          {preview ? (
            <Link
              href="/my-games?tab=history"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("viewAllHistory")}
            </Link>
          ) : null}
        </div>
      ) : null}

      <LibraryGameGrid
        games={items.map((item) => item.game)}
        source="history"
        metaByGameId={metaByGameId}
      />

      {!preview && fullQuery.hasNextPage ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={fullQuery.isFetchingNextPage}
            onClick={() => {
              void fullQuery.fetchNextPage();
            }}
          >
            {fullQuery.isFetchingNextPage ? tCommon("loading") : tCommon("loadMore")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
