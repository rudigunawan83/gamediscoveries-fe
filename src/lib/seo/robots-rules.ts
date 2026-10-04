/** Shared robots disallow paths for MetadataRoute.Robots and diagnostics. */
export const ROBOTS_DISALLOW = [
  "/login",
  "/signup",
  "/my-games",
  "/account",
  "/admin",
  "/offline",
  "/api/",
  "/community/notifications",
] as const;

export const ROBOTS_ALLOW = [
  "/",
  "/game/",
  "/games/",
  "/discover/",
  "/community/",
  "/collections/",
  "/games-like/",
  "/trending",
  "/new",
  "/mobile",
  "/multiplayer",
] as const;
