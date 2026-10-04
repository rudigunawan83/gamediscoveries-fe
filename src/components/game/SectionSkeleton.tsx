import { Skeleton } from "@/components/ui/skeleton";
import { GameGridSkeleton } from "@/components/game/GameGridSkeleton";

export function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <GameGridSkeleton />
    </div>
  );
}
