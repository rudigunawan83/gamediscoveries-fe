import { EmptyState } from "@/components/common/EmptyState";
import { GameGrid } from "@/components/game/GameGrid";
import { SearchInput } from "@/components/search/SearchInput";
import { mockGames } from "@/features/games/mock/games.mock";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Search",
  path: "/search",
});

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  const results = query
    ? mockGames.filter((game) => {
        const haystack = [
          game.title,
          game.description ?? "",
          ...game.tags,
          ...game.categories.map((category) => category.name),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
    : [];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">
          Search foundation ready for Meilisearch integration.
        </p>
        <SearchInput initialQuery={q} autoFocus />
      </div>

      {query ? (
        results.length > 0 ? (
          <GameGrid games={results} />
        ) : (
          <EmptyState
            title="No games found"
            description={`Nothing matched “${q}”. Try another genre, tag, or title.`}
          />
        )
      ) : (
        <EmptyState
          title="Start searching"
          description="Try racing, puzzle, multiplayer, or a game title."
        />
      )}
    </div>
  );
}
