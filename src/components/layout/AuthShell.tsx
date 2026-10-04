import Image from "next/image";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden text-foreground">
      <Image
        src="/images/hero-background.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(105deg,rgba(5,8,18,0.88)_0%,rgba(7,11,24,0.72)_42%,rgba(7,11,24,0.55)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_40%,rgba(168,85,247,0.18),transparent_70%)]"
      />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="px-5 pt-5 sm:px-8 sm:pt-7">
          <BrandLogo
            size="lg"
            showTagline
            tagline="Discover · Play · Explore"
          />
        </header>
        <main className="flex flex-1 flex-col px-4 pb-8 pt-6 sm:px-8 sm:pb-10 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
