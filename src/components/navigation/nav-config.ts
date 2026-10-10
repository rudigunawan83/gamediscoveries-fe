import type { Messages } from "next-intl";

export type NavLabelKey = keyof Messages["Nav"];

export const desktopNavItems = [
  { href: "/", label: "home" },
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/community", label: "community" },
  { href: "/hot-games", label: "hot" },
  { href: "/best-games", label: "best" },
  { href: "/most-played", label: "mostPlayed" },
  { href: "/exclusive-games", label: "exclusive" },
  { href: "/games", label: "games" },
  { href: "/multiplayer", label: "multiplayer" },
] as const satisfies readonly { href: string; label: NavLabelKey }[];

/** Same tabs as the Flutter app's bottom navigation. */
export const mobileBottomNavItems = [
  { href: "/", label: "home", icon: "home" },
  { href: "/search", label: "discover", icon: "search" },
  { href: "/play", label: "play", icon: "gamepad" },
  { href: "/missions", label: "missions", icon: "flag" },
  { href: "/profile", label: "profile", icon: "user" },
] as const satisfies readonly { href: string; label: NavLabelKey; icon: string }[];

/** Game detail opens full screen on phones, like the app (no site header or tabs). */
export function isGameDetailPath(pathname: string) {
  return /^\/game\/[^/]+\/?$/.test(pathname);
}

/** App screens pushed over the tabs; on phones they bring their own back-arrow header. */
const MOBILE_SUBPAGE_PATHS = new Set([
  "/favorites",
  "/history",
  "/progress",
  "/achievements",
  "/leaderboard",
  "/community",
  "/community/saved",
  "/community/notifications",
  "/my-reviews",
  "/settings",
  "/help",
]);

/** Full-screen pages on phones: no site header and no bottom tabs. */
export function isMobileFullScreenPath(pathname: string) {
  return (
    isGameDetailPath(pathname) ||
    /^\/community\/post\/[^/]+\/?$/.test(pathname) ||
    MOBILE_SUBPAGE_PATHS.has(pathname.replace(/(.)\/$/, "$1"))
  );
}
