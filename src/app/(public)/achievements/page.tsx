import { getTranslations } from "next-intl/server";
import { MobileAchievements } from "@/features/mobile-tabs/components/MobileGamification";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Gamification");
  return createMetadata({
    title: t("achievements"),
    description: t("achievementsMetaDescription"),
    path: "/achievements",
    noIndex: true,
  });
}

export default function AchievementsRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileAchievements />
    </div>
  );
}
