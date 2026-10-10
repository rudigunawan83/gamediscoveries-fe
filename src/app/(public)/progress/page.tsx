import { getTranslations } from "next-intl/server";
import { MobileProgress } from "@/features/mobile-tabs/components/MobileGamification";
import { ProgressPageView } from "@/features/progress/components/ProgressPageView";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const [tNav, t] = await Promise.all([getTranslations("Nav"), getTranslations("Gamification")]);
  return createMetadata({
    title: tNav("progress"),
    description: t("progressMetaDescription"),
    path: "/progress",
    noIndex: true,
  });
}

export default function ProgressRoutePage() {
  return (
    <>
      <div className="mx-auto max-w-xl lg:hidden">
        <MobileProgress />
      </div>
      <main className="container mx-auto hidden px-4 py-8 md:py-12 lg:block">
        <ProgressPageView />
      </main>
    </>
  );
}
