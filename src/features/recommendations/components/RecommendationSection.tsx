"use client";

import { GameSection } from "@/components/game/GameSection";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import {
  useBecauseYouPlayed,
  useForYou,
  useHiddenGems,
  useSimilarGames,
} from "@/features/recommendations/hooks/useRecommendations";

export function ForYouSection() {
  const { data, isPending } = useForYou(12);
  if (isPending) return <SectionSkeleton />;
  return (
    <GameSection
      title="Recommended For You"
      description="Personalized picks based on your play history and favorites."
      games={data?.games ?? []}
      href="/discover"
      variant="discovery"
    />
  );
}

export function HiddenGemsSection() {
  const { data, isPending } = useHiddenGems(12);
  if (isPending) return <SectionSkeleton />;
  return (
    <GameSection
      title="Hidden Gems"
      description="Strong games with lower exposure across the catalog."
      games={data?.games ?? []}
      href="/discover"
      variant="discovery"
    />
  );
}

export function BecauseYouPlayedSection() {
  const { data, isPending } = useBecauseYouPlayed(12);
  if (isPending) return null;
  if (!data?.games.length) return null;
  return (
    <GameSection
      title="Because You Played"
      description="More games like your recent sessions."
      games={data.games}
      href="/my-games?tab=history"
      variant="discovery"
    />
  );
}

export function SimilarGamesSection({
  gameId,
  fallbackGames = [],
}: {
  gameId: string;
  fallbackGames?: import("@/types/game").Game[];
}) {
  const { data, isPending } = useSimilarGames(gameId, 12);
  if (isPending && fallbackGames.length === 0) return <SectionSkeleton />;
  const games = data?.games?.length ? data.games : fallbackGames;
  return (
    <GameSection
      title="Similar Games"
      description="More titles with matching categories and tags."
      games={games.slice(0, 6)}
      variant="discovery"
    />
  );
}
