import Link from "next/link";
import type { Category } from "@/types/game";

type GameBreadcrumbsProps = {
  gameTitle: string;
  categories: Category[];
};

export function GameBreadcrumbs({ gameTitle, categories }: GameBreadcrumbsProps) {
  const category = categories[0];

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href="/games" className="hover:text-primary">
            Games
          </Link>
        </li>
        {category ? (
          <>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/games?category=${encodeURIComponent(category.name)}`}
                className="hover:text-primary"
              >
                {category.name}
              </Link>
            </li>
          </>
        ) : null}
        <li aria-hidden="true">/</li>
        <li className="truncate font-medium text-foreground" aria-current="page">
          {gameTitle}
        </li>
      </ol>
    </nav>
  );
}
