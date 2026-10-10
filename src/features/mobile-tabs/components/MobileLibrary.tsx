"use client";

import { useEffect, useRef } from "react";
import { Heart, History } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { FavoriteButton } from "@/features/my-games/components/FavoriteButton";
import { useFavorites } from "@/features/my-games/hooks/useFavorites";
import { useHistory } from "@/features/my-games/hooks/useHistory";
import type { HistoryItem } from "@/features/my-games/types/my-games.types";
import { formatHistoryMeta } from "@/features/my-games/utils/formatPlayTime";
import { MobileSubpageHeader } from "./MobileSubpageHeader";
import { MobileGameListSkeleton, MobileGameListTile, MobileMessage } from "./MobileTabUi";

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[18px] border border-[#ff5d73]/40 bg-[#15151d] p-4">
      <p className="text-sm text-[#9c9cb0]">Something went wrong. Please try again.</p>
      <button type="button" onClick={onRetry} className="mt-2 text-sm font-bold text-[#ffc83d]">
        Try again
      </button>
    </div>
  );
}

/** Mirrors the app's My Favorites screen. */
export function MobileFavorites() {
  const { accessToken } = useAuth();
  const query = useFavorites({ pageSize: 50 });
  const items = query.data?.items ?? [];

  return (
    <div>
      <MobileSubpageHeader title="My Favorites" />
      {!accessToken ? (
        <MobileMessage
          icon={Heart}
          title="Save your favorites"
          message="Sign in to keep a list of games you love."
          signIn
        />
      ) : query.isPending ? (
        <MobileGameListSkeleton />
      ) : query.isError ? (
        <LoadError onRetry={() => void query.refetch()} />
      ) : items.length === 0 ? (
        <MobileMessage
          icon={Heart}
          title="No favorites yet"
          message="Tap the heart on any game to save it here."
          action={{ href: "/search", label: "Discover Games" }}
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

export function historySubtitle(item: HistoryItem) {
  const meta = formatHistoryMeta(item);
  return item.playCount > 1 ? `${meta} · ${item.playCount} plays` : meta;
}

/** Mirrors the app's Play History screen. */
export function MobileHistory() {
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
      <MobileSubpageHeader title="Play History" />
      {!accessToken ? (
        <MobileMessage
          icon={History}
          title="Your play history"
          message="Sign in to pick up right where you left off."
          signIn
        />
      ) : query.isPending ? (
        <MobileGameListSkeleton />
      ) : query.isError ? (
        <LoadError onRetry={() => void query.refetch()} />
      ) : items.length === 0 ? (
        <MobileMessage
          icon={History}
          title="Nothing played yet"
          message="Games you play will show up here."
          action={{ href: "/search", label: "Find a Game" }}
        />
      ) : (
        <>
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li key={item.id}>
                <MobileGameListTile game={item.game} subtitle={historySubtitle(item)} />
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
