import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export { AUTH_COOKIE_NAME };

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function readAccessTokenFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!match) {
    return null;
  }

  const value = decodeURIComponent(match.slice(AUTH_COOKIE_NAME.length + 1));
  return value || null;
}

export function writeAccessTokenCookie(token: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearAccessTokenCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
