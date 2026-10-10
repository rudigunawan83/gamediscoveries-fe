import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import { MyGamesPage } from "@/features/my-games";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations();
  return createMetadata({
    title: t("Nav.myGames"),
    description: t("Library.myGamesMetaDescription"),
    path: "/my-games",
    noIndex: true,
  });
}

export default function MyGamesRoutePage() {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <MyGamesPage />
    </Suspense>
  );
}
