"use client";

import Link from "next/link";
import type { MyGamesTab } from "@/features/my-games/types/my-games.types";
import {
  MY_GAMES_TABS,
  myGamesTabHref,
  myGamesTabLabel,
} from "@/features/my-games/utils/myGamesTabs";
import { cn } from "@/lib/utils";

type MyGamesTabsProps = {
  activeTab: MyGamesTab;
};

export function MyGamesTabs({ activeTab }: MyGamesTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="My Games sections"
      className="flex flex-wrap gap-2 border-b border-border/40 pb-1"
    >
      {MY_GAMES_TABS.map((tab) => {
        const selected = tab === activeTab;
        return (
          <Link
            key={tab}
            href={myGamesTabHref(tab)}
            role="tab"
            aria-selected={selected}
            id={`my-games-tab-${tab}`}
            className={cn(
              "relative rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {myGamesTabLabel(tab)}
            {selected ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-2 -bottom-[5px] h-0.5 rounded-full bg-primary shadow-[0_0_12px_rgb(212_160_23_/_55%)]"
              />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
