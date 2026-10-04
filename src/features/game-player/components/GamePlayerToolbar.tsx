"use client";

import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type GamePlayerToolbarProps = {
  title: string;
  backHref: string;
  fullscreenSupported: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
};

export function GamePlayerToolbar({
  title,
  backHref,
  fullscreenSupported,
  isFullscreen,
  onToggleFullscreen,
}: GamePlayerToolbarProps) {
  return (
    <header
      className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-[#060914]/95 px-3 backdrop-blur-md sm:px-4"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <Link
        href={backHref}
        className="inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-md text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Back to game details"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </Link>

      <h1 className="min-w-0 flex-1 truncate font-display text-sm font-semibold text-white sm:text-base">
        {title}
      </h1>

      <button
        type="button"
        onClick={onToggleFullscreen}
        disabled={!fullscreenSupported}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className={cn(
          "inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-md text-white transition",
          "hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        {isFullscreen ? (
          <Minimize2 className="size-5" aria-hidden="true" />
        ) : (
          <Maximize2 className="size-5" aria-hidden="true" />
        )}
      </button>
    </header>
  );
}
