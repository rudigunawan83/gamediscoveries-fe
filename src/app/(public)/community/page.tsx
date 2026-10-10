import { CommunityHome } from "@/features/community/components/CommunityHome";
import { MobileCommunity } from "@/features/mobile-tabs/components/MobileCommunity";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Community",
  description:
    "Discuss games, share discoveries, join challenges, and follow player activity on GameDiscoveries.",
  path: "/community",
});

export default function CommunityPage() {
  return (
    <>
      <div className="mx-auto max-w-xl lg:hidden">
        <MobileCommunity />
      </div>
      <div className="hidden lg:block">
        <CommunityHome />
      </div>
    </>
  );
}
