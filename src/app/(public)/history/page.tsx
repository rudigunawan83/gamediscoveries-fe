import { getTranslations } from "next-intl/server";
import { MobileHistory } from "@/features/mobile-tabs/components/MobileLibrary";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Library");
  return createMetadata({
    title: t("historyTitle"),
    description: t("historyMetaDescription"),
    path: "/history",
    noIndex: true,
  });
}

export default function HistoryRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileHistory />
    </div>
  );
}
