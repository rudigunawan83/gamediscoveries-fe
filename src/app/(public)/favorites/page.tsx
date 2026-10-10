import { getTranslations } from "next-intl/server";
import { MobileFavorites } from "@/features/mobile-tabs/components/MobileLibrary";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Library");
  return createMetadata({
    title: t("favoritesTitle"),
    description: t("favoritesMetaDescription"),
    path: "/favorites",
    noIndex: true,
  });
}

export default function FavoritesRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileFavorites />
    </div>
  );
}
