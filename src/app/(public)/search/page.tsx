import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import { SearchInput } from "@/components/search/SearchInput";
import { MobileDiscover } from "@/features/mobile-tabs/components/MobileDiscover";
import { SearchResults } from "@/features/search/components/SearchResults";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Search");
  return createMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/search",
    noIndex: true,
    follow: true,
  });
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const t = await getTranslations("Search");

  return (
    <>
    <div className="lg:hidden">
      <MobileDiscover key={q} initialQuery={q} />
    </div>
    <div className="hidden space-y-8 lg:block">
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("intro")}</p>
        <SearchInput initialQuery={q} autoFocus />
      </div>

      <Suspense fallback={<SectionSkeleton />}>
        <SearchResults query={q} />
      </Suspense>
    </div>
    </>
  );
}
