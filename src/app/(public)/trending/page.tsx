import { GameSection } from "@/components/game/GameSection";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Trending",
  path: "/trending",
});

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  const home = await fetchHomeDiscoveries();

  return (
    <GameSection
      title="Trending Now"
      description="Hot games from the live catalog."
      games={home.trending}
    />
  );
}
