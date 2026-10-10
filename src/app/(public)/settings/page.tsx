import { getTranslations } from "next-intl/server";
import { MobileAccountSettings } from "@/features/mobile-tabs/components/MobileAccount";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Settings");
  return createMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/settings",
    noIndex: true,
  });
}

export default function SettingsRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileAccountSettings />
    </div>
  );
}
