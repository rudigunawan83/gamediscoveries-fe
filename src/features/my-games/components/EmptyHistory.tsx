import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyHistory() {
  return (
    <section
      className="rounded-3xl border border-border/50 bg-card/40 px-6 py-14 text-center"
      aria-labelledby="empty-history-title"
    >
      <h2
        id="empty-history-title"
        className="font-display text-2xl font-semibold text-white"
      >
        Nothing Played Yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Start playing games and your recent activity will appear here.
      </p>
      <Button asChild className="mt-6 bg-brand-gradient text-[#1a1205]">
        <Link href="/discover">Discover Games</Link>
      </Button>
    </section>
  );
}
