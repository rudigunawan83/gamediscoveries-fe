import Image from "next/image";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#0b0b10] text-foreground lg:bg-transparent">
      <div className="hidden lg:block">
        <Image
          src="/images/hero-background.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center]"
        />
        {/* Keep character visible; darken only the content side for readability */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(105deg,rgba(4,8,18,0.88)_0%,rgba(4,8,18,0.62)_46%,rgba(4,8,18,0.28)_72%,rgba(4,8,18,0.18)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_85%_30%,rgba(251,146,60,0.18),transparent_55%),radial-gradient(ellipse_55%_45%_at_15%_20%,rgba(168,85,247,0.22),transparent_60%)]"
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 lg:px-8 lg:pt-8">
        <header className="hidden shrink-0 lg:block">
          <BrandLogo
            size="md"
            showTagline
            tagline="Discover · Play · Explore"
          />
        </header>
        <main className="flex flex-1 flex-col lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
