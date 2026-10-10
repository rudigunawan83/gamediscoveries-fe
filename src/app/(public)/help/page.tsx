import { getTranslations } from "next-intl/server";
import { MobileHelp } from "@/features/mobile-tabs/components/MobileAccount";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Help");
  return createMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/help",
    noIndex: true,
  });
}

export default function HelpRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileHelp />
    </div>
  );
}
