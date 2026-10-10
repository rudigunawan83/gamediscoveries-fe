import { getTranslations } from "next-intl/server";
import { GameSection } from "@/components/game/GameSection";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("mostPlayedTitle"),
    description: t("mostPlayedDescription"),
    path: "/most-played",
  });
}

export const dynamic = "force-dynamic";

export default async function MostPlayedPage() {
  const [home, t, tNav] = await Promise.all([
    fetchHomeDiscoveries(),
    getTranslations("Seo"),
    getTranslations("Nav"),
  ]);

  return (
    <GameSection
      title={tNav("mostPlayed")}
      description={t("mostPlayedSectionDescription")}
      games={home.mostPlayed}
    />
  );
}
