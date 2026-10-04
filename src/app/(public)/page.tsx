import { DiscoveryHero } from "@/components/discovery/DiscoveryHero";
import { DiscoverFeed } from "@/features/games/components/DiscoverFeed";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Home",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="space-y-10 md:space-y-14">
      <DiscoveryHero />
      <DiscoverFeed />
    </div>
  );
}
