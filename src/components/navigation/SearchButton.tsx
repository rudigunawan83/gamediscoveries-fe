"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useUiStore } from "@/stores/ui.store";

export function SearchButton() {
  const openSearch = useUiStore((state) => state.openSearch);

  return (
    <Link
      href="/search"
      onClick={openSearch}
      aria-label="Search games"
      className="hidden h-10 items-center gap-2 rounded-full border border-white/10 bg-[#12192d]/90 px-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-white md:inline-flex"
    >
      <Search className="size-4" aria-hidden="true" />
      <span>Search</span>
    </Link>
  );
}
