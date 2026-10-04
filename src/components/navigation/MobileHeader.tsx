import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/seo/constants";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-display text-base font-bold tracking-tight">
          <span className="text-primary">Game</span>Discoveries
          <span className="sr-only">{SITE_NAME}</span>
        </Link>
        <Button asChild variant="ghost" size="icon" aria-label="Search games">
          <Link href="/search">
            <Search className="size-5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
