import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Category } from "@/types/game";

type GameBreadcrumbsProps = {
  gameTitle: string;
  categories: Category[];
};

export function GameBreadcrumbs({ gameTitle, categories }: GameBreadcrumbsProps) {
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const category = categories[0];

  return (
    <nav aria-label={tCommon("breadcrumb")} className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-primary">
            {t("home")}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href="/games" className="hover:text-primary">
            {t("games")}
          </Link>
        </li>
        {category ? (
          <>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/games/${category.slug}`}
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
