import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { fetchCategories } from "@/features/seo/api/categories.api";
import { shouldIndexCategory } from "@/lib/seo/indexability";

const MAX_LINKS = 10;

/** Site-wide links to the largest indexable categories; thin categories are left out. */
export async function FooterCategoryLinks() {
  const [categories, t] = await Promise.all([fetchCategories(), getTranslations("Nav")]);
  const links = categories
    .filter((category) => shouldIndexCategory(category).index)
    .sort((a, b) => (b.gameCount ?? 0) - (a.gameCount ?? 0))
    .slice(0, MAX_LINKS);
  if (links.length === 0) return null;

  return (
    <nav
      aria-label={t("footerCategoriesLabel")}
      className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground"
    >
      {links.map((category) => (
        <Link key={category.slug} href={`/games/${category.slug}`} className="hover:text-primary">
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
