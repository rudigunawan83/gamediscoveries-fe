"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GamePlayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#060914] px-6 text-center"
    >
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-white">Game Player Error</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Something went wrong while preparing this game. You can retry or explore other games.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset} className="bg-brand-gradient text-[#1a1205]">
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link href="/games">Explore Games</Link>
        </Button>
      </div>
    </div>
  );
}
