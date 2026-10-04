import { GameSection } from "@/components/game/GameSection";
import { fetchGames, fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Multiplayer",
  path: "/multiplayer",
});

export const dynamic = "force-dynamic";

export default async function MultiplayerPage() {
  const home = await fetchHomeDiscoveries();
  const games =
    home.multiplayer.length > 0
      ? home.multiplayer
      : await fetchGames({
          page: 1,
          pageSize: 48,
          category: "Multiplayer",
          sort: "popular",
        });

  return (
    <GameSection
      title="Multiplayer"
      description="Play with friends — competitive or co-op."
      games={games}
    />
  );
}
