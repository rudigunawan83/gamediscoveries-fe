export const desktopNavItems = [
  { href: "/", label: "Home" },
  { href: "/community", label: "Community" },
  { href: "/hot-games", label: "Hot" },
  { href: "/best-games", label: "Best" },
  { href: "/most-played", label: "Most Played" },
  { href: "/exclusive-games", label: "Exclusive" },
  { href: "/games", label: "Games" },
  { href: "/multiplayer", label: "Multiplayer" },
] as const;

export const mobileBottomNavItems = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/community", label: "Community", icon: "users" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/my-games", label: "My Games", icon: "gamepad" },
] as const;
