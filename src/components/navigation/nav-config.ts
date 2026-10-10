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
  { href: "/my-games", label: "Play", icon: "gamepad" },
  { href: "/missions", label: "Missions", icon: "flag" },
  { href: "/progress", label: "Profile", icon: "user" },
] as const;
