import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <div className="space-y-6 rounded-3xl border border-border/60 bg-card/40 p-8 md:p-12">
      <Skeleton className="h-10 w-3/4 max-w-xl" />
      <Skeleton className="h-5 w-full max-w-lg" />
      <Skeleton className="h-12 w-full max-w-2xl" />
      <div className="flex gap-3">
        <Skeleton className="h-11 w-36" />
        <Skeleton className="h-11 w-32" />
      </div>
    </div>
  );
}
