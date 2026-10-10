import { getTranslations } from "next-intl/server";
import { GameSection } from "@/components/game/GameSection";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("bestTitle"),
    description: t("bestDescription"),
    path: "/best-games",
  });
}

export const dynamic = "force-dynamic";

export default async function BestGamesPage() {
  const [home, t] = await Promise.all([fetchHomeDiscoveries(), getTranslations("Seo")]);

  return (
    <GameSection
      title={t("bestTitle")}
      description={t("bestSectionDescription")}
      games={home.bestGames}
    />
  );
}
