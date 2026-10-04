"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  getCurrentUserRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from "@/features/auth/api/authApi";
import { authKeys } from "@/features/auth/api/authQueries";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type {
  LoginCredentials,
  RegisterCredentials,
} from "@/features/auth/types/auth.types";
import { analytics } from "@/lib/analytics/client";
import { ApiClientError } from "@/lib/api/types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  const establishSession = useCallback(
    async (
      result: Awaited<ReturnType<typeof loginRequest>>,
      callbackUrl: string,
    ) => {
      let nextUser = result.user ?? null;
      setSession(result.accessToken, nextUser);

      if (!nextUser) {
        try {
          nextUser = await getCurrentUserRequest();
          setUser(nextUser);
        } catch {
          // Backend may expose auth without /users/me yet.
        }
      }

      await queryClient.invalidateQueries({ queryKey: authKeys.all });
      router.replace(callbackUrl || "/");
      return result;
    },
    [queryClient, router, setSession, setUser],
  );

  const login = useCallback(
    async (credentials: LoginCredentials, callbackUrl = "/") => {
      analytics.track("auth_login_submitted", { method: "password" });

      try {
        const result = await loginRequest(credentials);
        const session = await establishSession(result, callbackUrl);
        analytics.track("auth_login_succeeded", { method: "password" });
        return session;
      } catch (error) {
        analytics.track("auth_login_failed", {
          method: "password",
          status: error instanceof ApiClientError ? error.status : 0,
        });
        throw error;
      }
    },
    [establishSession],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials, callbackUrl = "/") => {
      analytics.track("auth_register_submitted", { method: "password" });

      try {
        const result = await registerRequest(credentials);
        const session = await establishSession(result, callbackUrl);
        analytics.track("auth_register_succeeded", { method: "password" });
        return session;
      } catch (error) {
        analytics.track("auth_register_failed", {
          method: "password",
          status: error instanceof ApiClientError ? error.status : 0,
        });
        throw error;
      }
    },
    [establishSession],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Always clear local state even if logout endpoint fails.
    } finally {
      clearSession();
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.removeQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          ["favorites", "history", "my-games", "recommendations", "favorite-status"].includes(
            query.queryKey[0],
          ),
      });
      analytics.track("auth_logout", { method: "password" });
      router.replace("/");
    }
  }, [clearSession, queryClient, router]);

  return {
    accessToken,
    user,
    isAuthenticated: Boolean(accessToken),
    login,
    register,
    logout,
  };
}
