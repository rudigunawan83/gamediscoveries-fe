import Link from "next/link";
import { Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/search/SearchInput";

export function DiscoveryHero() {
  return (
    <section
      aria-labelledby="discovery-hero-heading"
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/50 px-6 py-10 md:px-12 md:py-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-secondary/25 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          GameDiscoveries
        </p>
        <h1
          id="discovery-hero-heading"
          className="font-display text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
        >
          Discover Your Next Game
        </h1>
        <p className="max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
          Thousands of games. One place to find your next favorite.
        </p>

        <div className="w-full max-w-2xl">
          <SearchInput />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link href="/games">
              <Search className="size-4" aria-hidden="true" />
              Explore Games
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="gap-2">
            <Link href="/discover">
              <Play className="size-4" aria-hidden="true" />
              Quick Play
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
