import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { DiscoveryHero } from "@/components/discovery/DiscoveryHero";
import { DiscoverFeed } from "@/features/games/components/DiscoverFeed";
import { fetchHomeDiscoveries } from "@/features/games/api/games.api";
import { MobileHome } from "@/features/mobile-home/components/MobileHome";
import { HomeContinuePlaying } from "@/features/my-games/components/HomeContinuePlaying";
import { getTranslations } from "next-intl/server";
import { createMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const tNav = await getTranslations("Nav");
  return createMetadata({
    title: tNav("home"),
    path: "/",
  });
}

export default async function HomePage() {
  // Server-rendered shelves put game links in the initial HTML; a failed prefetch
  // falls back to the client fetch the feeds already do.
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["discoveries", "home", "v2"],
    queryFn: fetchHomeDiscoveries,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="lg:hidden">
        <MobileHome />
      </div>
      <div className="hidden space-y-10 md:space-y-14 lg:block">
        <DiscoveryHero />
        <HomeContinuePlaying />
        <DiscoverFeed />
      </div>
    </HydrationBoundary>
  );
}
