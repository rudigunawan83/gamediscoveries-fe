import { DiscoveryHero } from "@/components/discovery/DiscoveryHero";
import { DiscoverFeed } from "@/features/games/components/DiscoverFeed";
import { MobileHome } from "@/features/mobile-home/components/MobileHome";
import { HomeContinuePlaying } from "@/features/my-games/components/HomeContinuePlaying";
import { getTranslations } from "next-intl/server";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const tNav = await getTranslations("Nav");
  return createMetadata({
    title: tNav("home"),
    path: "/",
  });
}

export default function HomePage() {
  return (
    <>
      <div className="lg:hidden">
        <MobileHome />
      </div>
      <div className="hidden space-y-10 md:space-y-14 lg:block">
        <DiscoveryHero />
        <HomeContinuePlaying />
        <DiscoverFeed />
      </div>
    </>
  );
}
