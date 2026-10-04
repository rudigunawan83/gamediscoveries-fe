import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";
import { discoveryPageDescription } from "@/lib/seo/descriptions";
import { itemListJsonLd } from "@/lib/seo/structured-data";

export const metadata = createMetadata({
  title: "New Games — Fresh Discoveries",
  description: discoveryPageDescription("new"),
  path: "/new",
});

export const dynamic = "force-dynamic";

export default async function NewGamesPage() {
  const home = await fetchHomeDiscoveries();

  return (
    <div className="space-y-10">
      <JsonLd data={itemListJsonLd("New Games", "/new", home.latest)} />
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          New Discoveries
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {discoveryPageDescription("new")} Timestamps come from provider/catalog
          publish dates — we do not fake freshness.
        </p>
      </header>
      <GameSection
        title="Recently added"
        description="Newest titles from the live catalog."
        games={home.latest}
        variant="discovery"
      />
      <SeoRelatedLinks
        links={[
          { href: "/trending", label: "Trending" },
          { href: "/collections/hidden-gems", label: "Hidden gems" },
          { href: "/games", label: "All games" },
        ]}
      />
    </div>
  );
}
