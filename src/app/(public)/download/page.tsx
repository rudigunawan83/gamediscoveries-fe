import { AppDownloadView } from "@/features/app-download/components/AppDownloadView";
import { getTranslations } from "next-intl/server";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("downloadTitle"),
    description: t("downloadDescription"),
    path: "/download",
  });
}

export default function DownloadPage() {
  return <AppDownloadView />;
}
