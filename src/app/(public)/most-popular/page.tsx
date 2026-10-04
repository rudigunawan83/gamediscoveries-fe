import { GameSection } from "@/components/game/GameSection";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Most Popular Games",
  description:
    "Play the most popular free online games on GameDiscoveries. Discover top-rated HTML5 titles players love.",
  path: "/most-popular",
});

export const dynamic = "force-dynamic";

export default async function MostPopularPage() {
  const home = await fetchHomeDiscoveries();

  return (
    <GameSection
      title="Most Popular"
      description="Top games from the live popular catalog."
      games={home.popular}
    />
  );
}
