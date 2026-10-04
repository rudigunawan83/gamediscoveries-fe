import { env } from "@/config/env";

/** Build an absolute canonical URL for a site path. */
export function buildCanonicalUrl(path = "/"): string {
  const normalized = normalizePath(path);
  return new URL(normalized, env.NEXT_PUBLIC_APP_URL).toString();
}

/** Normalize path: leading slash, no trailing slash (except root), strip query/hash. */
export function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  const withoutQuery = path.split("?")[0]?.split("#")[0] ?? "/";
  const withLeading = withoutQuery.startsWith("/")
    ? withoutQuery
    : `/${withoutQuery}`;
  const trimmed = withLeading.replace(/\/+$/, "");
  return trimmed || "/";
}

/** Paths that should never be treated as canonical SEO landings. */
export function isPrivateSeoPath(path: string): boolean {
  const p = normalizePath(path).toLowerCase();
  return (
    p.startsWith("/login") ||
    p.startsWith("/signup") ||
    p.startsWith("/my-games") ||
    p.startsWith("/account") ||
    p.startsWith("/notifications") ||
    p.startsWith("/admin") ||
    p.startsWith("/offline") ||
    /\/play$/.test(p)
  );
}
