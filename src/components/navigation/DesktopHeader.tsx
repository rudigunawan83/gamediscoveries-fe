import { BrandLogo } from "@/components/brand/BrandLogo";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { SearchButton } from "@/components/navigation/SearchButton";
import { UserMenu } from "@/components/navigation/UserMenu";

export function DesktopHeader() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-primary/15 bg-[#0a0c12]/80 backdrop-blur-xl lg:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-8">
          <BrandLogo size="md" />
          <DesktopNav />
        </div>
        <div className="flex items-center gap-3">
          <SearchButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
