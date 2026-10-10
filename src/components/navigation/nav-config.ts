export const desktopNavItems = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/community", label: "Community" },
  { href: "/hot-games", label: "Hot" },
  { href: "/best-games", label: "Best" },
  { href: "/most-played", label: "Most Played" },
  { href: "/exclusive-games", label: "Exclusive" },
  { href: "/games", label: "Games" },
  { href: "/multiplayer", label: "Multiplayer" },
] as const;

/** Same tabs as the Flutter app's bottom navigation. */
export const mobileBottomNavItems = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/search", label: "Discover", icon: "search" },
  { href: "/play", label: "Play", icon: "gamepad" },
  { href: "/missions", label: "Missions", icon: "flag" },
  { href: "/profile", label: "Profile", icon: "user" },
] as const;

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
