import { CategorySection } from "@/components/discovery/CategorySection";
import { DiscoveryHero } from "@/components/discovery/DiscoveryHero";
import { GameSection } from "@/components/game/GameSection";
import {
  mockCategories,
  mockMultiplayerGames,
  mockNewGames,
  mockQuickPlayGames,
  mockRecommendedGames,
  mockTrendingGames,
} from "@/features/games/mock/games.mock";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Home",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="space-y-12 md:space-y-16">
      <DiscoveryHero />
      <GameSection
        title="Recommended For You"
        description="A starter mix of games you might love."
        games={mockRecommendedGames}
        href="/discover"
      />
      <GameSection
        title="Trending Now"
        description="What players are jumping into today."
        games={mockTrendingGames}
        href="/trending"
      />
      <GameSection
        title="New Discoveries"
        description="Fresh titles freshly surfaced for exploration."
        games={mockNewGames}
        href="/new"
      />
      <GameSection
        title="Quick Play"
        description="Short sessions. Instant fun."
        games={mockQuickPlayGames}
        href="/discover"
      />
      <CategorySection categories={mockCategories} />
      <GameSection
        title="Multiplayer"
        description="Play together — competitive or co-op."
        games={mockMultiplayerGames}
        href="/multiplayer"
      />
    </div>
  );
}
