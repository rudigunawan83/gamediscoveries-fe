import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import {
  getDiscoveryRanking,
  mapRankingItemToGame,
} from "@/lib/api/discovery-rankings";
import { createMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd } from "@/lib/seo/structured-data";

export const metadata = createMetadata({
  title: "Rising Games — Play Free Online",
  description:
    "Discover rising games with strong recent growth and momentum on GameDiscoveries.",
  path: "/rising",
});

export const dynamic = "force-dynamic";

export default async function RisingPage() {
  const ranking = (
    await getDiscoveryRanking({ type: "RISING", period: "24h", limit: 24 })
  ).data;
  const games = (ranking?.items ?? []).map(mapRankingItemToGame);

  return (
    <div className="space-y-10">
      <JsonLd data={itemListJsonLd("Rising Games", "/rising", games)} />
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Rising Games
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Games accelerating in valid sessions and engagement over the last 24
          hours.
        </p>
      </header>
      <GameSection
        title="Rising now"
        description="Strong momentum, not just historical popularity."
        games={games}
        variant="discovery"
      />
      <SeoRelatedLinks
        links={[
          { href: "/trending", label: "Trending" },
          { href: "/new", label: "New games" },
          { href: "/most-popular", label: "Popular" },
          { href: "/games", label: "All games" },
        ]}
      />
    </div>
  );
}
