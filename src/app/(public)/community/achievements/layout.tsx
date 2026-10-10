import { getTranslations } from "next-intl/server";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const [tCommunity, t] = await Promise.all([getTranslations("Community"), getTranslations("Seo")]);
  return createMetadata({
    title: tCommunity("achievementsTitle"),
    description: t("achievementsDescription"),
    path: "/community/achievements",
  });
}

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
