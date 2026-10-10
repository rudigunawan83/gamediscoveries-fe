import { getTranslations } from "next-intl/server";
import { MobileCommunitySaved } from "@/features/mobile-tabs/components/MobileCommunity";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Community");
  return createMetadata({
    title: t("savedPostsTitle"),
    description: t("savedMetaDescription"),
    path: "/community/saved",
    noIndex: true,
  });
}

export default function CommunitySavedRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileCommunitySaved />
    </div>
  );
}
