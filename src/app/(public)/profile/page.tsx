import { getTranslations } from "next-intl/server";
import { MobileProfile } from "@/features/mobile-tabs/components/MobileProfile";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Profile");
  return createMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/profile",
    noIndex: true,
  });
}

export default function ProfileRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileProfile />
    </div>
  );
}
