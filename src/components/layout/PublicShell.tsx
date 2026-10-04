import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { OrganicLandingTracker } from "@/features/seo/components/OrganicLandingTracker";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <DesktopHeader />
      <MobileHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 md:px-6 lg:pb-10">
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
      <Suspense fallback={null}>
        <OrganicLandingTracker />
      </Suspense>
    </div>
  );
}
