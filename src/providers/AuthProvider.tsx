"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { authKeys } from "@/features/auth/api/authQueries";
import {
  clearAuthSession,
  getAccessToken,
} from "@/features/auth/stores/authStore";
import { clearAccessTokenCookie } from "@/lib/auth/session";
import {
  registerAuthTokenGetter,
  registerUnauthorizedHandler,
} from "@/lib/auth/token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    registerAuthTokenGetter(() => getAccessToken());

    registerUnauthorizedHandler(() => {
      clearAuthSession();
      clearAccessTokenCookie();
      queryClient.removeQueries({ queryKey: authKeys.all });

      if (typeof window === "undefined") {
        return;
      }

      const { pathname, search } = window.location;
      if (pathname.startsWith("/login")) {
        return;
      }

      const callbackUrl = `${pathname}${search}`;
      router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    });
  }, [queryClient, router]);

  return children;
}
