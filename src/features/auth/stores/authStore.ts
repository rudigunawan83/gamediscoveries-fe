"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/features/auth/types/auth.types";
import {
  clearAccessTokenCookie,
  writeAccessTokenCookie,
} from "@/lib/auth/session";

interface AuthStore {
  accessToken: string | null;
  user: AuthUser | null;
  setSession: (accessToken: string, user?: AuthUser | null) => void;
  setUser: (user: AuthUser | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: (accessToken, user = null) => {
        writeAccessTokenCookie(accessToken);
        set({ accessToken, user });
      },
      setUser: (user) => set({ user }),
      clearSession: () => {
        clearAccessTokenCookie();
        set({ accessToken: null, user: null });
      },
    }),
    {
      name: "gd-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          writeAccessTokenCookie(state.accessToken);
        }
      },
    },
  ),
);

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function clearAuthSession() {
  useAuthStore.getState().clearSession();
}
