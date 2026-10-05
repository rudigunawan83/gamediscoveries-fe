import { MissionsPageView } from "@/features/missions/components/MissionsPageView";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Missions",
  description: "Daily missions and weekly challenges on GameDiscoveries.",
  path: "/missions",
  noIndex: true,
});

export default function MissionsRoutePage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <MissionsPageView />
    </main>
  );
}
