import { getTranslations } from "next-intl/server";
import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import { fetchGames, fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("multiplayerTitle"),
    description: t("multiplayerDescription"),
    path: "/multiplayer",
  });
}

export const dynamic = "force-dynamic";

export default async function MultiplayerPage() {
  const [home, t, tDiscovery] = await Promise.all([
    fetchHomeDiscoveries(),
    getTranslations("Seo"),
    getTranslations("Discovery"),
  ]);
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
      <JsonLd data={itemListJsonLd(t("multiplayerHeading"), "/multiplayer", games)} />
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("multiplayerHeading")}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {t("multiplayerDescription")}
        </p>
      </header>
      <GameSection
        title={t("multiplayerSectionTitle")}
        description={t("multiplayerSectionDescription")}
        games={games}
        variant="discovery"
      />
      <SeoRelatedLinks
        links={[
          {
            href: "/collections/best-2-player-games",
            label: t("linkBest2Player"),
          },
          {
            href: "/collections/games-to-play-with-friends",
            label: t("linkPlayWithFriends"),
          },
          { href: "/mobile", label: tDiscovery("linkMobileGames") },
          { href: "/games", label: t("linkAllGames") },
        ]}
      />
    </div>
  );
}
