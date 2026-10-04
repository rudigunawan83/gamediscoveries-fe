import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyMyGames() {
  return (
    <section
      className="rounded-3xl border border-border/50 bg-card/40 px-6 py-14 text-center"
      aria-labelledby="empty-my-games-title"
    >
      <h2
        id="empty-my-games-title"
        className="font-display text-2xl font-semibold text-white"
      >
        Your Game Library Is Empty
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Discover a game and start building your personal library.
      </p>
      <Button asChild className="mt-6 bg-brand-gradient text-[#1a1205]">
        <Link href="/">Discover Games</Link>
      </Button>
    </section>
  );
}
