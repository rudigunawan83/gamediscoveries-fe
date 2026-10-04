import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyFavorites() {
  return (
    <section
      className="rounded-3xl border border-border/50 bg-card/40 px-6 py-14 text-center"
      aria-labelledby="empty-favorites-title"
    >
      <h2
        id="empty-favorites-title"
        className="font-display text-2xl font-semibold text-white"
      >
        No Favorites Yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Save games you love and they&apos;ll appear here.
      </p>
      <Button asChild className="mt-6 bg-brand-gradient text-[#1a1205]">
        <Link href="/games">Explore Games</Link>
      </Button>
    </section>
  );
}
