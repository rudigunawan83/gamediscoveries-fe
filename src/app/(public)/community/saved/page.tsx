import { MobileCommunitySaved } from "@/features/mobile-tabs/components/MobileCommunity";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Saved Posts",
  description: "Community posts you saved on this device.",
  path: "/community/saved",
  noIndex: true,
});

export default function CommunitySavedRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileCommunitySaved />
    </div>
  );
}
