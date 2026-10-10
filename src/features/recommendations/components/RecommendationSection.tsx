"use client";

import { useTranslations } from "next-intl";
import { GameSection } from "@/components/game/GameSection";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import {
  useBecauseYouPlayed,
  useForYou,
  useHiddenGems,
  useSimilarGames,
} from "@/features/recommendations/hooks/useRecommendations";

export function ForYouSection() {
  const t = useTranslations("Discovery");
  const { data, isPending } = useForYou(12);
  if (isPending) return <SectionSkeleton />;
  return (
    <GameSection
      title={t("shelfRecommended")}
      description={t("forYouDescription")}
      games={data?.games ?? []}
      href="/"
      variant="discovery"
    />
  );
}

export function HiddenGemsSection() {
  const t = useTranslations("Discovery");
  const { data, isPending } = useHiddenGems(12);
  if (isPending) return <SectionSkeleton />;
  return (
    <GameSection
      title={t("hiddenGemsTitle")}
      description={t("hiddenGemsDescription")}
      games={data?.games ?? []}
      href="/"
      variant="discovery"
    />
  );
}

export function BecauseYouPlayedSection() {
  const t = useTranslations("Discovery");
  const { data, isPending } = useBecauseYouPlayed(12);
  if (isPending) return null;
  if (!data?.games.length) return null;
  return (
    <GameSection
      title={t("becauseYouPlayedTitle")}
      description={t("becauseYouPlayedDescription")}
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
  const t = useTranslations("Discovery");
  const tGame = useTranslations("Game");
  const { data, isPending } = useSimilarGames(gameId, 12);
  if (isPending && fallbackGames.length === 0) return <SectionSkeleton />;
  const games = data?.games?.length ? data.games : fallbackGames;
  return (
    <GameSection
      title={tGame("similarGames")}
      description={t("similarDescription")}
      games={games.slice(0, 6)}
      variant="discovery"
    />
  );
}
