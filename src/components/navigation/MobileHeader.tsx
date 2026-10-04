import Link from "next/link";
import { Search } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { UserMenu } from "@/components/navigation/UserMenu";
import { Button } from "@/components/ui/button";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl lg:hidden">
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <BrandLogo size="sm" className="min-w-0" />
        <div className="flex shrink-0 items-center gap-1.5">
          <Button asChild variant="ghost" size="icon" aria-label="Search games">
            <Link href="/search">
              <Search className="size-5" aria-hidden="true" />
            </Link>
          </Button>
          <UserMenu compact />
        </div>
      </div>
    </header>
  );
}
