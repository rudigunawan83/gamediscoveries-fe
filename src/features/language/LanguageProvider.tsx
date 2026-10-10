"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { LanguageMode } from "@/i18n/config";
import { updatePreferredLanguage } from "./api/preferencesApi";
import {
  languageNeedsSync,
  readLanguageCookie,
  setLanguageNeedsSync,
  writeLanguageCookie,
} from "./languageStorage";

interface LanguageContextValue {
  mode: LanguageMode;
  setMode: (mode: LanguageMode) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Applies the language mode and keeps it in sync with the signed-in account.
 *
 * Conflict policy when a session starts or the current user is refreshed:
 * a choice made in this browser that was never saved to the account (picked
 * while signed out, or a failed upload) wins and is uploaded; otherwise the
 * account's language replaces the local one.
 */
export function LanguageProvider({
  mode: serverMode,
  children,
}: {
  mode: LanguageMode;
  children: ReactNode;
}) {
  const router = useRouter();
  // Shows a choice right away until the refreshed layout reports the new mode.
  const [pending, setPending] = useState<{ mode: LanguageMode; from: LanguageMode } | null>(null);
  const mode = pending && pending.from === serverMode ? pending.mode : serverMode;
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);
  const savedMode = useAuthStore((state) => state.user?.preferredLanguage);

  const apply = useCallback(
    (next: LanguageMode) => {
      writeLanguageCookie(next);
      router.refresh();
    },
    [router],
  );

  const uploading = useRef<LanguageMode | null>(null);
  const upload = useCallback(async (next: LanguageMode) => {
    if (uploading.current === next) return;
    uploading.current = next;
    try {
      const user = await updatePreferredLanguage(next);
      if (readLanguageCookie() !== next) return;
      setLanguageNeedsSync(false);
      useAuthStore.getState().setUser(user);
    } catch {
      // Stays marked for sync and is retried on the next sign-in or change.
    } finally {
      if (uploading.current === next) uploading.current = null;
    }
  }, []);

  const setMode = useCallback(
    async (next: LanguageMode) => {
      setLanguageNeedsSync(true);
      setPending({ mode: next, from: serverMode });
      apply(next);
      if (useAuthStore.getState().accessToken) {
        await upload(next);
      }
    },
    [apply, upload, serverMode],
  );

  useEffect(() => {
    if (!accessToken || !userId) return;
    const current = readLanguageCookie();
    if (languageNeedsSync()) {
      void upload(current);
    } else if (savedMode && savedMode !== current) {
      apply(savedMode);
    }
  }, [accessToken, userId, savedMode, apply, upload]);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }
  return context;
}
