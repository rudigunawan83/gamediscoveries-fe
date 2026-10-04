import { GameSection } from "@/components/game/GameSection";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Hot Games",
  description:
    "Play hot free online games trending right now. Instant browser play, no download required.",
  path: "/hot-games",
});

export const dynamic = "force-dynamic";

export default async function HotGamesPage() {
  const home = await fetchHomeDiscoveries();

  return (
    <GameSection
      title="Hot Games"
      description="Hot picks synced from GameMonetize popularity feeds."
      games={home.hotGames}
    />
  );
}
