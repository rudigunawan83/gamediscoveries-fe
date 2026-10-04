import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Offline",
  description: "You are offline. Reconnect to discover more games.",
  path: "/offline",
  noIndex: true,
});

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center gap-6 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-center">
      <BrandLogo size="lg" href="/" />
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">
          You&apos;ve gone offline.
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Reconnect to discover more games. Cached pages may still be available.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="min-h-11 min-w-28">
          <Link href="/">Retry</Link>
        </Button>
        <Button asChild variant="outline" className="min-h-11 min-w-28">
          <Link href="/my-games">My Games</Link>
        </Button>
      </div>
    </main>
  );
}
