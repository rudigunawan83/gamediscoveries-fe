import Link from "next/link";
import { fetchIndexableCollections } from "@/features/seo/api/collections.api";
import { shouldIndexCollection } from "@/lib/seo/indexability";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Game Collections",
  description:
    "Curated free online game collections — browser games, mobile picks, multiplayer, and hidden gems on GameDiscoveries.",
  path: "/collections",
});

export const dynamic = "force-dynamic";

export default async function CollectionsIndexPage() {
  const collections = await fetchIndexableCollections();
  const visible = collections.filter((c) => shouldIndexCollection(c).index);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Collections
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Editorial and hybrid game collections with enough real catalog depth to
          be useful — not mass-generated thin pages.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {visible.map((collection) => (
          <li key={collection.slug}>
            <Link
              href={`/collections/${collection.slug}`}
              className="block rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/40"
            >
              <h2 className="font-display text-lg font-semibold">
                {collection.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {collection.description}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {collection.games?.length ?? 0} games
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
