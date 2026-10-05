import { CommunityHome } from "@/features/community/components/CommunityHome";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Community",
  description:
    "Discuss games, share discoveries, join challenges, and follow player activity on GameDiscoveries.",
  path: "/community",
});

export default function CommunityPage() {
  return (
    <div>
      <CommunityHome />
    </div>
  );
}
