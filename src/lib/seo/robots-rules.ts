/**
 * Shared robots disallow paths for MetadataRoute.Robots and diagnostics.
 * Do not list /search here — Google must crawl noindex search pages.
 * Do not treat robots.txt as access control.
 */
export const ROBOTS_DISALLOW = [
  "/login",
  "/signup",
  "/my-games",
  "/account",
  "/favorites",
  "/history",
  "/settings",
  "/progress",
  "/admin",
  "/offline",
  "/api/",
  "/community/notifications",
] as const;

/** Documented public crawl targets (robots.ts allows "/" and relies on disallow). */
export const ROBOTS_ALLOW = [
  "/",
  "/game/",
  "/games/",
  "/community/",
  "/collections/",
  "/games-like/",
  "/trending",
  "/new",
  "/mobile",
  "/multiplayer",
] as const;
