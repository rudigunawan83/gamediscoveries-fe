import Link from "next/link";
import { Search } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <BrandLogo size="sm" />
        <Button asChild variant="ghost" size="icon" aria-label="Search games">
          <Link href="/search">
            <Search className="size-5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
