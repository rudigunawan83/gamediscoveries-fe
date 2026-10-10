import { getTranslations } from "next-intl/server";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const [tNav, t] = await Promise.all([getTranslations("Nav"), getTranslations("Notifications")]);
  return createMetadata({
    title: tNav("notifications"),
    description: t("metaDescription"),
    path: "/community/notifications",
    noIndex: true,
  });
}

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
