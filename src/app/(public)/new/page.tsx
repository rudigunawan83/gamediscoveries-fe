import { getTranslations } from "next-intl/server";
import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("newTitle"),
    description: t("newDescription"),
    path: "/new",
  });
}

export const dynamic = "force-dynamic";

export default async function NewGamesPage() {
  const [home, t, tDiscovery] = await Promise.all([
    fetchHomeDiscoveries(),
    getTranslations("Seo"),
    getTranslations("Discovery"),
  ]);

  return (
    <div className="space-y-10">
      <JsonLd data={itemListJsonLd(t("newListName"), "/new", home.latest)} />
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("newHeading")}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {t("newDescription")} {t("newIntro")}
        </p>
      </header>
      <GameSection
        title={t("newSectionTitle")}
        description={t("newSectionDescription")}
        games={home.latest}
        variant="discovery"
      />
      <SeoRelatedLinks
        links={[
          { href: "/trending", label: tDiscovery("linkTrending") },
          { href: "/collections/hidden-gems", label: t("linkHiddenGems") },
          { href: "/games", label: t("linkAllGames") },
        ]}
      />
    </div>
  );
}
