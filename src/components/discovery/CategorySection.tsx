import Link from "next/link";
import type { Category } from "@/types/game";

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section aria-labelledby="popular-categories-heading" className="space-y-4">
      <div className="space-y-1">
        <h2 id="popular-categories-heading" className="font-display text-2xl font-semibold">
          Popular Categories
        </h2>
        <p className="text-sm text-muted-foreground">
          Jump into the moods and genres players love right now.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/games?category=${category.slug}`}
              className="flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-primary/50 hover:bg-accent/40"
            >
              <span className="font-display text-lg font-semibold">{category.name}</span>
              <span className="mt-3 text-xs text-muted-foreground">
                {category.gameCount ?? 0} games
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
