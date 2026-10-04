export const desktopNavItems = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/hot-games", label: "Hot" },
  { href: "/best-games", label: "Best" },
  { href: "/most-played", label: "Most Played" },
  { href: "/exclusive-games", label: "Exclusive" },
  { href: "/games", label: "Games" },
  { href: "/multiplayer", label: "Multiplayer" },
] as const;

export const mobileBottomNavItems = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/discover", label: "Discover", icon: "compass" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/my-games", label: "My Games", icon: "gamepad" },
] as const;
