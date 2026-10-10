import { CommunityHome } from "@/features/community/components/CommunityHome";
import { MobileCommunity } from "@/features/mobile-tabs/components/MobileCommunity";
import { getTranslations } from "next-intl/server";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const [tNav, t] = await Promise.all([getTranslations("Nav"), getTranslations("Seo")]);
  return createMetadata({
    title: tNav("community"),
    description: t("communityDescription"),
    path: "/community",
  });
}

export default function CommunityPage() {
  return (
    <>
      <div className="mx-auto max-w-xl lg:hidden">
        <MobileCommunity />
      </div>
      <div className="hidden lg:block">
        <CommunityHome />
      </div>
    </>
  );
}
