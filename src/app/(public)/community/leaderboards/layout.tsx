import { getTranslations } from "next-intl/server";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const [tCommunity, t] = await Promise.all([getTranslations("Community"), getTranslations("Seo")]);
  return createMetadata({
    title: tCommunity("leaderboardsTitle"),
    description: t("leaderboardsDescription"),
    path: "/community/leaderboards",
  });
}

export default function LeaderboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
