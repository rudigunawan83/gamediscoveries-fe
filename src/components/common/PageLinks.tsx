import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { pageHref, pageWindow } from "@/lib/seo/pagination";
import { cn } from "@/lib/utils";

/** Plain links (no client JS) so crawlers can walk every page of a listing. */
export async function PageLinks({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const t = await getTranslations("Discovery");
  const pages = pageWindow(page, totalPages);
  const linkClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/10 px-3 text-sm hover:border-primary/60 hover:text-primary";

  return (
    <nav aria-label={t("catalogPagination")} className="flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link href={pageHref(basePath, page - 1)} rel="prev" className={linkClass}>
          {t("previousPage")}
        </Link>
      ) : null}
      {pages.map((item, index) => (
        <span key={item} className="contents">
          {index > 0 && item - pages[index - 1]! > 1 ? (
            <span aria-hidden="true" className="px-1 text-muted-foreground">
              …
            </span>
          ) : null}
          <Link
            href={pageHref(basePath, item)}
            aria-label={t("pageNumber", { page: item })}
            aria-current={item === page ? "page" : undefined}
            className={cn(linkClass, item === page && "border-primary bg-primary/15 font-semibold text-primary")}
          >
            {item}
          </Link>
        </span>
      ))}
      {page < totalPages ? (
        <Link href={pageHref(basePath, page + 1)} rel="next" className={linkClass}>
          {t("nextPage")}
        </Link>
      ) : null}
    </nav>
  );
}
