import { Suspense } from "react";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResults } from "@/features/search/components/SearchResults";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Search",
  description:
    "Search free online games on GameDiscoveries. Results pages are not indexed to prevent query-parameter URL explosion.",
  path: "/search",
  noIndex: true,
  follow: true,
});

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">
          Find games by title, genre, or keyword across the live catalog.
        </p>
        <SearchInput initialQuery={q} autoFocus />
      </div>

      <Suspense fallback={<SectionSkeleton />}>
        <SearchResults query={q} />
      </Suspense>
    </div>
  );
}
