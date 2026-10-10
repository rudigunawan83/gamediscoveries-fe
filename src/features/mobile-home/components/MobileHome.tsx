"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Download, Search } from "lucide-react";
import { ErrorState } from "@/components/common/ErrorState";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { HomeContinuePlaying } from "@/features/my-games/components/HomeContinuePlaying";
import { mapRecommendationItems } from "@/features/recommendations/mappers";
import { getRecommendationHome } from "@/lib/api/recommendations";
import { MobileFeaturedCarousel } from "./MobileFeaturedCarousel";
import { MobileGameShelf, MobileGameShelfSkeleton } from "./MobileGameShelf";
import { MobileHomeHeader } from "./MobileHomeHeader";

/**
 * Phone layout of the home page, mirroring the Flutter app's Home tab.
 * Shares query keys with the desktop feed so both render from one fetch.
 */
export function MobileHome() {
  const home = useQuery({
    queryKey: ["discoveries", "home", "v2"],
    queryFn: fetchHomeDiscoveries,
    staleTime: 60_000,
  });
  const recommendations = useQuery({
    queryKey: ["recommendations", "home"],
    queryFn: async () => (await getRecommendationHome(12)).data!,
    staleTime: 60_000,
  });

  const data = home.data;
  const forYou = recommendations.data?.sections?.[0]?.items;
  const recommended = forYou?.length ? mapRecommendationItems(forYou) : (data?.trending ?? []);

  return (
    <div className="space-y-7">
      <MobileHomeHeader />

      <Link
        href="/search"
        className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-[#15151d] px-4 text-sm text-muted-foreground"
      >
        <Search className="size-5" aria-hidden="true" />
        Search games…
      </Link>

      <Link
        href="/search"
        aria-label="New Adventures Every Day. Explore the latest and trending games!"
        className="relative block aspect-[950/330] overflow-hidden rounded-[20px] bg-[#15151d]"
      >
        <Image
          src="/images/home-banner.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </Link>

      <HomeContinuePlaying />

      <Link
        href="/download"
        className="flex items-center gap-3 rounded-2xl border border-[#ffc83d]/30 bg-[#1e1e29] p-3"
      >
        <Image
          src="/images/app-icon.png"
          alt=""
          width={44}
          height={44}
          className="rounded-xl"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-white">
            Get the Android app
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Faster play, notifications and Watch &amp; Earn XP
          </span>
        </span>
        <Download className="size-5 shrink-0 text-primary" aria-hidden="true" />
      </Link>

      {home.isPending ? (
        <div className="space-y-7">
          <MobileGameShelfSkeleton />
          <MobileGameShelfSkeleton />
          <MobileGameShelfSkeleton />
        </div>
      ) : home.isError || !data ? (
        <ErrorState
          title="Games failed to load."
          description="We couldn't load the home feed. Please try again."
          onRetry={() => {
            void home.refetch();
          }}
        />
      ) : (
        <>
          <MobileGameShelf title="Recommended For You" games={recommended} href="/search" />
          <MobileFeaturedCarousel games={data.featured} />
          <MobileGameShelf title="Trending Now" games={data.trending} href="/trending" />
          <MobileGameShelf title="Made for Mobile" games={data.mobile} href="/mobile" />
          <MobileGameShelf title="Popular" games={data.popular} href="/most-popular" />
          <MobileGameShelf title="New Releases" games={data.latest} href="/new" />
          <MobileGameShelf title="Hot Games" games={data.hotGames} />
          <MobileGameShelf title="Most Played" games={data.mostPlayed} />
          <MobileGameShelf title="Best Games" games={data.bestGames} />
          <MobileGameShelf title="Multiplayer" games={data.multiplayer} />
          <MobileGameShelf title="Exclusive" games={data.exclusiveGames} />
        </>
      )}
    </div>
  );
}
