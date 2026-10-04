import Link from "next/link";
import { notFound } from "next/navigation";
import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { ShareButton } from "@/features/seo/components/ShareButton";
import { fetchResolvedCollection } from "@/features/seo/api/collections.api";
import { env } from "@/config/env";
import { generateCollectionMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbJsonLd,
  itemListJsonLd,
} from "@/lib/seo/structured-data";
import { shouldIndexCollection } from "@/lib/seo/indexability";

export const dynamic = "force-dynamic";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await fetchResolvedCollection(slug);
  if (!collection) {
    return generateCollectionMetadata({
      slug,
      title: "Collection",
      description: "Game collection on GameDiscoveries.",
      updatedAt: new Date().toISOString(),
      gameSlugs: [],
    });
  }
  return generateCollectionMetadata(collection);
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await fetchResolvedCollection(slug);
  if (!collection) notFound();

  const decision = shouldIndexCollection(collection);
  if (!decision.index) notFound();

  const games = collection.games ?? [];

  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Collections", path: "/collections" },
            { name: collection.title, path: `/collections/${collection.slug}` },
          ]),
          itemListJsonLd(collection.title, `/collections/${collection.slug}`, games),
        ]}
      />

      <header className="space-y-4">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/collections" className="hover:text-primary">
                Collections
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground" aria-current="page">
              {collection.title}
            </li>
          </ol>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {collection.title}
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              {collection.description}
            </p>
            {collection.rationale ? (
              <p className="max-w-3xl text-sm text-muted-foreground">
                Why this list: {collection.rationale}
              </p>
            ) : null}
          </div>
          <ShareButton
            title={collection.title}
            text={collection.description}
            url={`${env.NEXT_PUBLIC_APP_URL}/collections/${collection.slug}`}
            entityType="collection"
            entityId={collection.slug}
          />
        </div>
      </header>

      <GameSection
        title="Games in this collection"
        description={`${games.length} curated free online games.`}
        games={games}
        variant="discovery"
      />
    </div>
  );
}
