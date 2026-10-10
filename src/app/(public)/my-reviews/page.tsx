import { MobileMyReviews } from "@/features/mobile-tabs/components/MobileAccount";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "My Reviews",
  description: "Reviews you wrote on GameDiscoveries.",
  path: "/my-reviews",
  noIndex: true,
});

export default function MyReviewsRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileMyReviews />
    </div>
  );
}
