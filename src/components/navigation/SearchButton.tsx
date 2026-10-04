"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui.store";

export function SearchButton() {
  const openSearch = useUiStore((state) => state.openSearch);

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="hidden gap-2 border-border/80 bg-card/50 md:inline-flex"
    >
      <Link href="/search" onClick={openSearch} aria-label="Search games">
        <Search className="size-4" aria-hidden="true" />
        <span>Search</span>
      </Link>
    </Button>
  );
}
