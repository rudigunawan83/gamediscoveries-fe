import { getCategories } from "@/lib/api/categories";
import type { SeoCategory } from "@/features/seo/types";

export async function fetchCategories(): Promise<SeoCategory[]> {
  try {
    const response = await getCategories();
    return (response.data ?? []).map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      description: item.description ?? undefined,
      gameCount: item.gameCount,
      lastContentAt: item.lastContentAt ?? undefined,
    }));
  } catch {
    return [];
  }
}

export async function fetchCategoryBySlug(
  slug: string,
): Promise<SeoCategory | null> {
  const categories = await fetchCategories();
  return (
    categories.find(
      (c) => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase(),
    ) ?? null
  );
}
