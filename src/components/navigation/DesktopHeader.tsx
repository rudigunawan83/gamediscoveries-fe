import Link from "next/link";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { SearchButton } from "@/components/navigation/SearchButton";
import { UserMenu } from "@/components/navigation/UserMenu";
import { SITE_NAME } from "@/lib/seo/constants";

export function DesktopHeader() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-border/60 bg-background/80 backdrop-blur-xl lg:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-foreground"
          >
            <span className="text-primary">Game</span>Discoveries
            <span className="sr-only">{SITE_NAME}</span>
          </Link>
          <DesktopNav />
        </div>
        <div className="flex items-center gap-2">
          <SearchButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
