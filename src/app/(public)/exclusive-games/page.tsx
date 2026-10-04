import { GameSection } from "@/components/game/GameSection";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Exclusive Games",
  description:
    "Play exclusive-style free games and match classics inspired by favorites like Zuma. Instant play in your browser.",
  path: "/exclusive-games",
});

export const dynamic = "force-dynamic";

export default async function ExclusiveGamesPage() {
  const home = await fetchHomeDiscoveries();

  return (
    <GameSection
      title="Exclusive Games"
      description="Exclusive feed picks plus match-style classics."
      games={home.exclusiveGames}
    />
  );
}
