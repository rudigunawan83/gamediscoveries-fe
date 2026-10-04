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
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
          Community
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          What&apos;s happening in GameDiscoveries?
        </p>
      </header>
      <CommunityHome />
    </div>
  );
}
