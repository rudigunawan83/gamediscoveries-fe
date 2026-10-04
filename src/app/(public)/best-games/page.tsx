import { GameSection } from "@/components/game/GameSection";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Best Games",
  description:
    "Browse the best free online games curated for quality gameplay, fun, and replayability.",
  path: "/best-games",
});

export const dynamic = "force-dynamic";

export default async function BestGamesPage() {
  const home = await fetchHomeDiscoveries();

  return (
    <GameSection
      title="Best Games"
      description="Standout titles from the best-games feed."
      games={home.bestGames}
    />
  );
}
