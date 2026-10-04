import { Suspense } from "react";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import { MyGamesPage } from "@/features/my-games";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "My Games",
  description: "Your personal GameDiscoveries library.",
  path: "/my-games",
  noIndex: true,
});

export default function MyGamesRoutePage() {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <MyGamesPage />
    </Suspense>
  );
}
