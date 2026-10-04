import { GameSection } from "@/components/game/GameSection";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "New Games",
  path: "/new",
});

export const dynamic = "force-dynamic";

export default async function NewGamesPage() {
  const home = await fetchHomeDiscoveries();

  return (
    <GameSection
      title="New Discoveries"
      description="Recently synced titles from GameMonetize."
      games={home.latest}
    />
  );
}
