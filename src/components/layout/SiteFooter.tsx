import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="font-display text-lg font-semibold">
            <span className="text-primary">Game</span>Discoveries
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{SITE_TAGLINE}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/discover" className="hover:text-foreground">
            Discover
          </Link>
          <Link href="/trending" className="hover:text-foreground">
            Trending
          </Link>
          <Link href="/new" className="hover:text-foreground">
            New
          </Link>
          <Link href="/multiplayer" className="hover:text-foreground">
            Multiplayer
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. Foundation build.
        </p>
      </div>
    </footer>
  );
}
