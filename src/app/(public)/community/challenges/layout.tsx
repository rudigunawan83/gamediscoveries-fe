import { getTranslations } from "next-intl/server";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const [tCommunity, t] = await Promise.all([getTranslations("Community"), getTranslations("Seo")]);
  return createMetadata({
    title: tCommunity("challengesTitle"),
    description: t("challengesDescription"),
    path: "/community/challenges",
  });
}

export default function ChallengesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
