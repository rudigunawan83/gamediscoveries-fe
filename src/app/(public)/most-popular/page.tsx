import { getTranslations } from "next-intl/server";
import { GameSection } from "@/components/game/GameSection";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("mostPopularTitle"),
    description: t("mostPopularDescription"),
    path: "/most-popular",
  });
}

export const dynamic = "force-dynamic";

export default async function MostPopularPage() {
  const [home, t, tNav] = await Promise.all([
    fetchHomeDiscoveries(),
    getTranslations("Seo"),
    getTranslations("Nav"),
  ]);

  return (
    <GameSection
      title={tNav("mostPopular")}
      description={t("mostPopularSectionDescription")}
      games={home.popular}
    />
  );
}
