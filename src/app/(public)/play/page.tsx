import { getTranslations } from "next-intl/server";
import { MobilePlay } from "@/features/mobile-tabs/components/MobilePlay";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations();
  return createMetadata({
    title: t("Nav.play"),
    description: t("Library.playMetaDescription"),
    path: "/play",
    noIndex: true,
  });
}

export default function PlayRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobilePlay />
    </div>
  );
}
