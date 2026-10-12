import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Nav");
  return createMetadata({ title: t("progress"), path: "/progress/xp", noIndex: true });
}

export default function ProgressXpLayout({ children }: { children: ReactNode }) {
  return children;
}
