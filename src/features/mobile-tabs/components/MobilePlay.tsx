"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, Play } from "lucide-react";
import { ErrorState } from "@/components/common/ErrorState";
import { MobileGameShelf } from "@/features/mobile-home/components/MobileGameShelf";
import { HomeContinuePlaying } from "@/features/my-games/components/HomeContinuePlaying";
import { useHistoryPreview } from "@/features/my-games/hooks/useHistory";
import { mapRecommendationItems } from "@/features/recommendations/mappers";
import { getRecommendations } from "@/lib/api/recommendations";
import {
  MobileGameListSkeleton,
  MobileGameListTile,
  MobileMessage,
  MobileTabTitle,
} from "./MobileTabUi";

/** Mirrors the app's Play tab: continue playing, recently played, quick play. */
export function MobilePlay() {
  const history = useHistoryPreview(6);
  const recent = (history.data?.pages[0]?.items ?? []).slice(1).map((item) => item.game);

  const quickPlay = useQuery({
    queryKey: ["recommendations", "quick-play"],
    queryFn: async () => mapRecommendationItems((await getRecommendations("quick-play", 12)).data?.items ?? []),
    staleTime: 60_000,
  });

  return (
    <div className="space-y-6">
      <MobileTabTitle title="Play" />

      <HomeContinuePlaying />
      <MobileGameShelf title="Recently Played" games={recent} href="/history" />

      <section aria-labelledby="quick-play-title" className="space-y-3">
        <h2 id="quick-play-title" className="text-base font-extrabold text-white">
          Quick Play
        </h2>
        {quickPlay.isPending ? (
          <MobileGameListSkeleton count={5} />
        ) : quickPlay.isError ? (
          <ErrorState
            title="Quick play failed to load."
            description="Please check your connection and try again."
            onRetry={() => {
              void quickPlay.refetch();
            }}
          />
        ) : quickPlay.data.length === 0 ? (
          <MobileMessage icon={Gamepad2} message="No quick play picks right now." />
        ) : (
          <ul className="space-y-2.5">
            {quickPlay.data.map((game) => (
              <li key={game.id}>
                <MobileGameListTile
                  game={game}
                  trailing={
                    <Link
                      href={`/game/${game.slug}/play`}
                      aria-label={`Play ${game.title} now`}
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-[#ffc83d] text-[#1a1205]"
                    >
                      <Play className="size-5 fill-current" aria-hidden="true" />
                    </Link>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
