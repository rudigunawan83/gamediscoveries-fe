import { getTranslations } from "next-intl/server";
import { GameSection } from "@/components/game/GameSection";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("exclusiveTitle"),
    description: t("exclusiveDescription"),
    path: "/exclusive-games",
  });
}

export const dynamic = "force-dynamic";

export default async function ExclusiveGamesPage() {
  const [home, t] = await Promise.all([fetchHomeDiscoveries(), getTranslations("Seo")]);

  return (
    <GameSection
      title={t("exclusiveTitle")}
      description={t("exclusiveSectionDescription")}
      games={home.exclusiveGames}
    />
  );
}
