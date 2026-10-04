import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SITE_NAME } from "@/lib/seo/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-primary/15 bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <BrandLogo size="md" showTagline href={null} />
        <nav aria-label="Footer" className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/most-popular" className="hover:text-primary">
            Most Popular
          </Link>
          <Link href="/hot-games" className="hover:text-primary">
            Hot Games
          </Link>
          <Link href="/best-games" className="hover:text-primary">
            Best Games
          </Link>
          <Link href="/most-played" className="hover:text-primary">
            Most Played
          </Link>
          <Link href="/exclusive-games" className="hover:text-primary">
            Exclusive
          </Link>
          <Link href="/multiplayer" className="hover:text-primary">
            Multiplayer
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. Find · Play · Explore More.
        </p>
      </div>
    </footer>
  );
}
