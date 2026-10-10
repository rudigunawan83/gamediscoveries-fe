import { getTranslations } from "next-intl/server";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const [tNav, t] = await Promise.all([getTranslations("Nav"), getTranslations("Gamification")]);
  return createMetadata({
    title: tNav("leaderboard"),
    description: t("leaderboardMetaDescription"),
    path: "/leaderboard",
    noIndex: true,
  });
}

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
