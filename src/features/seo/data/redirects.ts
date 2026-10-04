/**
 * Safe permanent redirects for SEO lifecycle (slug/category renames).
 * Keep chains short — never point A→B→C; flatten to final target.
 */
export const SEO_REDIRECTS: Record<string, string> = {
  // Legacy query-style category URLs are handled in middleware.
  // Example slug renames:
  // "/game/old-slug": "/game/new-slug",
};

export function resolveSeoRedirect(pathname: string): string | null {
  return SEO_REDIRECTS[pathname] ?? null;
}
