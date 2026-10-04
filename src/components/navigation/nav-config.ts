export const desktopNavItems = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/games", label: "Games" },
  { href: "/trending", label: "Trending" },
  { href: "/new", label: "New" },
  { href: "/mobile", label: "Mobile" },
  { href: "/multiplayer", label: "Multiplayer" },
] as const;

export const mobileBottomNavItems = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/discover", label: "Discover", icon: "compass" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/my-games", label: "My Games", icon: "gamepad" },
] as const;
