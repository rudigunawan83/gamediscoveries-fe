import type { MyGamesTab } from "@/features/my-games/types/my-games.types";

export const MY_GAMES_TABS: readonly MyGamesTab[] = [
  "all",
  "favorites",
  "history",
] as const;

export function parseMyGamesTab(value: string | null | undefined): MyGamesTab {
  if (value === "favorites" || value === "history") {
    return value;
  }
  return "all";
}

export function myGamesTabLabel(tab: MyGamesTab): string {
  switch (tab) {
    case "favorites":
      return "Favorites";
    case "history":
      return "Recently Played";
    default:
      return "All";
  }
}

export function myGamesTabHref(tab: MyGamesTab): string {
  if (tab === "all") {
    return "/my-games";
  }
  return `/my-games?tab=${tab}`;
}
