import { getTranslations } from "next-intl/server";
import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import {
  getDiscoveryRanking,
  mapRankingItemToGame,
} from "@/lib/api/discovery-rankings";
import { createMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("risingTitle"),
    description: t("risingDescription"),
    path: "/rising",
  });
}

export const dynamic = "force-dynamic";

export default async function RisingPage() {
  const [ranking, t, tDiscovery] = await Promise.all([
    getDiscoveryRanking({ type: "RISING", period: "24h", limit: 24 }).then(
      (response) => response.data,
    ),
    getTranslations("Seo"),
    getTranslations("Discovery"),
  ]);
  const games = (ranking?.items ?? []).map(mapRankingItemToGame);

  return (
    <div className="space-y-10">
      <JsonLd data={itemListJsonLd(t("risingHeading"), "/rising", games)} />
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("risingHeading")}
        </h1>
        <p className="max-w-3xl text-muted-foreground">{t("risingIntro")}</p>
      </header>
      <GameSection
        title={t("risingSectionTitle")}
        description={t("risingSectionDescription")}
        games={games}
        variant="discovery"
      />
      <SeoRelatedLinks
        links={[
          { href: "/trending", label: tDiscovery("linkTrending") },
          { href: "/new", label: t("linkNewGames") },
          { href: "/most-popular", label: t("linkPopular") },
          { href: "/games", label: t("linkAllGames") },
        ]}
      />
    </div>
  );
}
