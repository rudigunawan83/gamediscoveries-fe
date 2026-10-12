import { cache } from "react";
import { getCategories } from "@/lib/api/categories";
import type { SeoCategory } from "@/features/seo/types";

const loadCategories = cache(async (): Promise<SeoCategory[]> => {
  const response = await getCategories();
  return (response.data ?? []).map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description ?? undefined,
    gameCount: item.gameCount,
    lastContentAt: item.lastContentAt ?? undefined,
  }));
});

export async function fetchCategories(): Promise<SeoCategory[]> {
  try {
    return await loadCategories();
  } catch {
    return [];
  }
}

// Throws on API failure so an outage is not rendered as a missing category.
export async function fetchCategoryBySlug(
  slug: string,
): Promise<SeoCategory | null> {
  const categories = await loadCategories();
  return (
    categories.find(
      (c) => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase(),
    ) ?? null
  );
}
