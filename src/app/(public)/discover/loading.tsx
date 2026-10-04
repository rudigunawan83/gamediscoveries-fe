import { HeroSkeleton } from "@/components/discovery/HeroSkeleton";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";

export default function DiscoverLoading() {
  return (
    <div className="space-y-10 md:space-y-14">
      <HeroSkeleton />
      <SectionSkeleton />
      <SectionSkeleton />
    </div>
  );
}
