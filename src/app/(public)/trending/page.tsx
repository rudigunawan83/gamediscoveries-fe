import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";
import { discoveryPageDescription } from "@/lib/seo/descriptions";
import { itemListJsonLd } from "@/lib/seo/structured-data";

export const metadata = createMetadata({
  title: "Trending Games — Play Free Online",
  description: discoveryPageDescription("trending"),
  path: "/trending",
});

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  const home = await fetchHomeDiscoveries();

  return (
    <div className="space-y-10">
      <JsonLd
        data={itemListJsonLd("Trending Games", "/trending", home.trending)}
      />
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Trending Games
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {discoveryPageDescription("trending")} Rankings reflect live catalog
          popularity signals — not daily dated archive URLs.
        </p>
      </header>
      <GameSection
        title="Trending now"
        description="Hot games from the live catalog."
        games={home.trending}
        variant="discovery"
      />
      <SeoRelatedLinks
        links={[
          { href: "/new", label: "New discoveries" },
          { href: "/hot-games", label: "Hot games" },
          { href: "/collections", label: "Collections" },
          { href: "/games", label: "All games" },
        ]}
      />
    </div>
  );
}
