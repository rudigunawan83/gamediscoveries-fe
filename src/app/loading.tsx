import { HeroSkeleton } from "@/components/discovery/HeroSkeleton";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";

export default function Loading() {
  return (
    <div className="space-y-12">
      <HeroSkeleton />
      <SectionSkeleton />
      <SectionSkeleton />
    </div>
  );
}
