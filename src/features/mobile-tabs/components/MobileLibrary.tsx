"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Heart, History } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { FavoriteButton } from "@/features/my-games/components/FavoriteButton";
import { useFavorites } from "@/features/my-games/hooks/useFavorites";
import { useHistory } from "@/features/my-games/hooks/useHistory";
import type { HistoryItem } from "@/features/my-games/types/my-games.types";
import type { HistoryFormatter } from "@/features/my-games/utils/formatPlayedAt";
import {
  formatHistoryMeta,
  useHistoryFormatter,
} from "@/features/my-games/utils/formatPlayTime";
import { MobileSubpageHeader } from "./MobileSubpageHeader";
import { MobileGameListSkeleton, MobileGameListTile, MobileMessage } from "./MobileTabUi";

function LoadError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("Common");
  return (
    <div className="rounded-[18px] border border-[#ff5d73]/40 bg-[#15151d] p-4">
      <p className="text-sm text-[#9c9cb0]">{t("errorGeneric")}</p>
      <button type="button" onClick={onRetry} className="mt-2 text-sm font-bold text-[#ffc83d]">
        {t("retry")}
      </button>
    </div>
  );
}

/** Mirrors the app's My Favorites screen. */
export function MobileFavorites() {
  const t = useTranslations("Library");
  const { accessToken } = useAuth();
  const query = useFavorites({ pageSize: 50 });
  const items = query.data?.items ?? [];

  return (
    <div>
      <MobileSubpageHeader title={t("favoritesTitle")} />
      {!accessToken ? (
        <MobileMessage
          icon={Heart}
          title={t("favoritesSignInTitle")}
          message={t("favoritesSignInMessage")}
          signIn
        />
      ) : query.isPending ? (
        <MobileGameListSkeleton />
      ) : query.isError ? (
        <LoadError onRetry={() => void query.refetch()} />
      ) : items.length === 0 ? (
        <MobileMessage
          icon={Heart}
          title={t("favoritesEmptyTitle")}
          message={t("favoritesEmptyMessage")}
          action={{ href: "/search", label: t("discoverGames") }}
        />
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.gameId}>
              <MobileGameListTile
                game={item.game}
                trailing={
                  <FavoriteButton
                    gameId={item.gameId}
                    source="mobile_favorites"
                    className="size-10 shrink-0 bg-transparent"
                  />
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function historySubtitle(fmt: HistoryFormatter, item: HistoryItem) {
  const meta = formatHistoryMeta(fmt, item);
  return item.playCount > 1
    ? `${meta} · ${fmt.t("playCount", { count: item.playCount })}`
    : meta;
}

/** Mirrors the app's Play History screen. */
export function MobileHistory() {
  const t = useTranslations("Library");
  const fmt = useHistoryFormatter();
  const { accessToken } = useAuth();
  const query = useHistory(24);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div>
      <MobileSubpageHeader title={t("historyTitle")} />
      {!accessToken ? (
        <MobileMessage
          icon={History}
          title={t("historySignInTitle")}
          message={t("historySignInMessage")}
          signIn
        />
      ) : query.isPending ? (
        <MobileGameListSkeleton />
      ) : query.isError ? (
        <LoadError onRetry={() => void query.refetch()} />
      ) : items.length === 0 ? (
        <MobileMessage
          icon={History}
          title={t("historyEmptyTitle")}
          message={t("historyEmptyMessage")}
          action={{ href: "/search", label: t("findGame") }}
        />
      ) : (
        <>
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li key={item.id}>
                <MobileGameListTile game={item.game} subtitle={historySubtitle(fmt, item)} />
              </li>
            ))}
          </ul>
          <div ref={sentinel} aria-hidden="true" />
          {isFetchingNextPage ? (
            <div className="mt-2.5">
              <MobileGameListSkeleton count={2} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
