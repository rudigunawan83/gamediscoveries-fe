import { MissionsPageView } from "@/features/missions/components/MissionsPageView";
import { MobileMissions } from "@/features/mobile-tabs/components/MobileMissions";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Missions",
  description: "Daily missions and weekly challenges on GameDiscoveries.",
  path: "/missions",
  noIndex: true,
});

export default function MissionsRoutePage() {
  return (
    <>
      <div className="lg:hidden">
        <MobileMissions />
      </div>
      <main className="container mx-auto hidden px-4 py-8 md:py-12 lg:block">
        <MissionsPageView />
      </main>
    </>
  );
}
