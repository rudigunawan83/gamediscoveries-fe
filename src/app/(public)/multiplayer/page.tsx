import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import { fetchGames, fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";
import { discoveryPageDescription } from "@/lib/seo/descriptions";
import { itemListJsonLd } from "@/lib/seo/structured-data";

export const metadata = createMetadata({
  title: "Multiplayer Games — Play Free Online",
  description: discoveryPageDescription("multiplayer"),
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
    <div className="space-y-10">
      <JsonLd data={itemListJsonLd("Multiplayer Games", "/multiplayer", games)} />
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Multiplayer Games
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {discoveryPageDescription("multiplayer")}
        </p>
      </header>
      <GameSection
        title="Play with friends"
        description="Competitive or co-op browser games from the live catalog."
        games={games}
        variant="discovery"
      />
      <SeoRelatedLinks
        links={[
          {
            href: "/collections/best-2-player-games",
            label: "Best 2 player collection",
          },
          {
            href: "/collections/games-to-play-with-friends",
            label: "Play with friends",
          },
          { href: "/mobile", label: "Mobile games" },
          { href: "/games", label: "All games" },
        ]}
      />
    </div>
  );
}
