import { GameSection } from "@/components/game/GameSection";
import { mockGames } from "@/features/games/mock/games.mock";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Mobile Games",
  path: "/mobile",
});

export default function MobileGamesPage() {
  const mobileGames = mockGames.filter((game) => game.mobileReady);

  return (
    <GameSection
      title="Mobile Ready"
      description="Games optimized for portrait and on-the-go play."
      games={mobileGames}
    />
  );
}
