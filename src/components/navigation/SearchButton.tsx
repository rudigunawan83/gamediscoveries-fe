"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUiStore } from "@/stores/ui.store";

export function SearchButton() {
  const openSearch = useUiStore((state) => state.openSearch);
  const t = useTranslations("Nav");

  return (
    <Link
      href="/search"
      onClick={openSearch}
      aria-label={t("searchGames")}
      className="hidden h-10 items-center gap-2 rounded-full border border-primary/20 bg-[#151820]/90 px-4 text-sm text-muted-foreground transition-colors hover:border-primary/45 hover:text-white md:inline-flex"
    >
      <Search className="size-4" aria-hidden="true" />
      <span>{t("search")}</span>
    </Link>
  );
}
