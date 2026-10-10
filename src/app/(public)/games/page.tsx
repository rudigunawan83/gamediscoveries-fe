import { GamesCatalog } from "@/features/games/components/GamesCatalog";
import { getTranslations } from "next-intl/server";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("gamesTitle"),
    description: t("gamesDescription"),
    path: "/games",
  });
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;

  return (
    <GamesCatalog category={params.category} search={params.q} />
  );
}
