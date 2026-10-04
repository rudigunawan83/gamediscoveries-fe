import { GameSection } from "@/components/game/GameSection";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Most Played Games",
  description:
    "Discover the most played free browser games with high engagement and endless replay value.",
  path: "/most-played",
});

export const dynamic = "force-dynamic";

export default async function MostPlayedPage() {
  const home = await fetchHomeDiscoveries();

  return (
    <GameSection
      title="Most Played"
      description="High-playtime favorites from the live catalog."
      games={home.mostPlayed}
    />
  );
}
