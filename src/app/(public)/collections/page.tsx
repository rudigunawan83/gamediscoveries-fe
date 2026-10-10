import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { fetchIndexableCollections } from "@/features/seo/api/collections.api";
import { localizeCollection } from "@/features/seo/data/collections";
import { shouldIndexCollection } from "@/lib/seo/indexability";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("collectionsTitle"),
    description: t("collectionsDescription"),
    path: "/collections",
  });
}

export const dynamic = "force-dynamic";

export default async function CollectionsIndexPage() {
  const [collections, t, tNav, tCollections] = await Promise.all([
    fetchIndexableCollections(),
    getTranslations("Seo"),
    getTranslations("Nav"),
    getTranslations("Collections"),
  ]);
  const visible = collections
    .filter((c) => shouldIndexCollection(c).index)
    .map((c) => localizeCollection(c, tCollections));

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {tNav("collections")}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{t("collectionsIntro")}</p>
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
                {t("collectionGamesCount", { count: collection.games?.length ?? 0 })}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
