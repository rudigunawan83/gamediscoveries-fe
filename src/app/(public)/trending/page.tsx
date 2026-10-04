import { GameSection } from "@/components/game/GameSection";
import { mockTrendingGames } from "@/features/games/mock/games.mock";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Trending",
  path: "/trending",
});

export default function TrendingPage() {
  return (
    <GameSection
      title="Trending Now"
      description="Hot games from the foundation mock dataset."
      games={mockTrendingGames}
    />
  );
}
