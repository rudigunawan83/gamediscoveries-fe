import { getTranslations } from "next-intl/server";
import { MobileMyReviews } from "@/features/mobile-tabs/components/MobileAccount";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Reviews");
  return createMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/my-reviews",
    noIndex: true,
  });
}

export default function MyReviewsRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileMyReviews />
    </div>
  );
}
