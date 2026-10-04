import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import { fetchGames } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";
import { discoveryPageDescription } from "@/lib/seo/descriptions";
import { itemListJsonLd } from "@/lib/seo/structured-data";

export const metadata = createMetadata({
  title: "Mobile Games — Play Free Online",
  description: discoveryPageDescription("mobile"),
  path: "/mobile",
});

export const dynamic = "force-dynamic";

export default async function MobileGamesPage() {
  const mobileGames = await fetchGames({
    page: 1,
    pageSize: 48,
    mobileReady: true,
    sort: "newest",
  });

  return (
    <div className="space-y-10">
      <JsonLd data={itemListJsonLd("Mobile Games", "/mobile", mobileGames)} />
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Mobile Games
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {discoveryPageDescription("mobile")} These titles are flagged
          mobile-ready in the catalog for touch-friendly play.
        </p>
      </header>
      <GameSection
        title="Mobile ready"
        description="Games optimized for portrait and on-the-go play."
        games={mobileGames}
        variant="discovery"
      />
      <SeoRelatedLinks
        links={[
          { href: "/collections/best-mobile-games", label: "Best mobile collection" },
          { href: "/multiplayer", label: "Multiplayer" },
          { href: "/games", label: "All games" },
        ]}
      />
    </div>
  );
}
