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

export function myGamesTabLabel(
  tab: MyGamesTab,
): "Nav.favorites" | "Nav.recentlyPlayed" | "Library.tabAll" {
  switch (tab) {
    case "favorites":
      return "Nav.favorites";
    case "history":
      return "Nav.recentlyPlayed";
    default:
      return "Library.tabAll";
  }
}

export function myGamesTabHref(tab: MyGamesTab): string {
  if (tab === "all") {
    return "/my-games";
  }
  return `/my-games?tab=${tab}`;
}
