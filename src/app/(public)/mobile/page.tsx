import { getTranslations } from "next-intl/server";
import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import { fetchGames } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("mobileTitle"),
    description: t("mobileDescription"),
    path: "/mobile",
  });
}

export const dynamic = "force-dynamic";

export default async function MobileGamesPage() {
  const [mobileGames, t, tNav] = await Promise.all([
    fetchGames({
      page: 1,
      pageSize: 48,
      mobileReady: true,
      sort: "newest",
    }),
    getTranslations("Seo"),
    getTranslations("Nav"),
  ]);

  return (
    <div className="space-y-10">
      <JsonLd data={itemListJsonLd(t("mobileHeading"), "/mobile", mobileGames)} />
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("mobileHeading")}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {t("mobileDescription")} {t("mobileIntro")}
        </p>
      </header>
      <GameSection
        title={t("mobileSectionTitle")}
        description={t("mobileSectionDescription")}
        games={mobileGames}
        variant="discovery"
      />
      <SeoRelatedLinks
        links={[
          { href: "/collections/best-mobile-games", label: t("linkBestMobile") },
          { href: "/multiplayer", label: tNav("multiplayer") },
          { href: "/games", label: t("linkAllGames") },
        ]}
      />
    </div>
  );
}
