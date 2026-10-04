import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { resolveSeoRedirect } from "@/features/seo/data/redirects";

const PROTECTED_PREFIXES = ["/my-games"];

function slugifyCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(token);
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const mapped = resolveSeoRedirect(pathname);
  if (mapped && mapped !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = mapped;
    url.search = "";
    return NextResponse.redirect(url, 308);
  }

  // Canonicalize /games?category=Action → /games/action
  if (pathname === "/games") {
    const category = searchParams.get("category");
    if (category?.trim()) {
      const slug = slugifyCategory(category);
      if (slug) {
        const url = request.nextUrl.clone();
        url.pathname = `/games/${slug}`;
        url.search = "";
        return NextResponse.redirect(url, 308);
      }
    }
  }

  if (isProtected && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (
    (pathname === "/login" || pathname === "/signup") &&
    isAuthenticated
  ) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/my-games/:path*",
    "/login",
    "/signup",
    "/games",
    "/game/:path*",
    "/collections/:path*",
    "/games-like/:path*",
  ],
};
