"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { analytics } from "@/lib/analytics/client";
import { getDisplayMode, isIos, isStandalone } from "@/lib/pwa/detection";
import {
  type BeforeInstallPromptEventLike,
  getPageViews,
  hasPlayed,
  incrementPageViews,
  isDismissedRecently,
  setDismissedNow,
  shouldShowInstallUi,
} from "@/lib/pwa/install";
import { getConnectionType, isOnline } from "@/lib/pwa/network";
import {
  listenForWaitingWorker,
  registerServiceWorker,
  requestSkipWaiting,
} from "@/lib/pwa/service-worker";

type PwaContextValue = {
  online: boolean;
  installed: boolean;
  showInstall: boolean;
  canPrompt: boolean;
  isIosDevice: boolean;
  updateAvailable: boolean;
  promptInstall: () => Promise<boolean>;
  dismissInstall: () => void;
  applyUpdate: () => void;
};

const PwaContext = createContext<PwaContextValue | null>(null);

function subscribeOnline(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function subscribeNever() {
  return () => {};
}

/** Engagement flags live in web storage; re-read them every few seconds. */
function subscribeEngagement(onStoreChange: () => void) {
  const tick = window.setInterval(onStoreChange, 5_000);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.clearInterval(tick);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function PwaContextProvider({ children }: { children: ReactNode }) {
  const online = useSyncExternalStore(
    subscribeOnline,
    () => isOnline(),
    () => true,
  );

  const standalone = useSyncExternalStore(subscribeNever, isStandalone, () => false);
  const ios = useSyncExternalStore(subscribeNever, isIos, () => false);
  const played = useSyncExternalStore(subscribeEngagement, hasPlayed, () => false);
  const storedDismissed = useSyncExternalStore(
    subscribeEngagement,
    () => isDismissedRecently(),
    () => false,
  );
  const pageViews = useSyncExternalStore(subscribeEngagement, getPageViews, () => 0);

  const [installedEvent, setInstalledEvent] = useState(false);
  const [dismissedNow, setDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEventLike | null>(null);
  const [updateWorker, setUpdateWorker] = useState<ServiceWorker | null>(null);
  const [sessionMs, setSessionMs] = useState(0);
  const [startedAt] = useState(() => Date.now());

  const installed = standalone || installedEvent;
  const dismissed = storedDismissed || dismissedNow;

  useEffect(() => {
    incrementPageViews();

    analytics.track("pwa_launch", {
      displayMode: getDisplayMode(),
      platform: navigator.platform,
      connection: getConnectionType(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEventLike);
    };
    const onInstalled = () => {
      setInstalledEvent(true);
      setDeferredPrompt(null);
      analytics.track("pwa_installed", {
        displayMode: getDisplayMode(),
        platform: navigator.platform,
      });
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    void registerServiceWorker().then((registration) => {
      if (!registration) return;
      listenForWaitingWorker(registration, (worker) => {
        setUpdateWorker(worker);
        analytics.track("pwa_update_available", {
          displayMode: getDisplayMode(),
        });
      });
    });

    const tick = window.setInterval(() => {
      setSessionMs(Date.now() - startedAt);
    }, 5_000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearInterval(tick);
    };
  }, [startedAt]);

  useEffect(() => {
    analytics.track(online ? "pwa_online" : "pwa_offline", {
      displayMode: getDisplayMode(),
      connection: getConnectionType(),
    });
  }, [online]);

  const canPrompt = Boolean(deferredPrompt);
  const showInstall = useMemo(
    () =>
      shouldShowInstallUi({
        installed,
        dismissed,
        pageViews,
        sessionMs,
        hasPlayed: played,
        canPrompt,
        isIos: ios,
      }),
    [installed, dismissed, pageViews, sessionMs, played, canPrompt, ios],
  );

  const value = useMemo<PwaContextValue>(
    () => ({
      online,
      installed,
      showInstall,
      canPrompt,
      isIosDevice: ios,
      updateAvailable: Boolean(updateWorker),
      promptInstall: async () => {
        if (!deferredPrompt) return false;
        analytics.track("pwa_install_prompt_shown", {
          source: "manual",
          displayMode: getDisplayMode(),
        });
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (choice.outcome === "accepted") {
          analytics.track("pwa_install_prompt_accepted", {
            platform: choice.platform,
          });
          return true;
        }
        analytics.track("pwa_install_prompt_dismissed", {
          platform: choice.platform,
        });
        setDismissedNow();
        setDismissed(true);
        return false;
      },
      dismissInstall: () => {
        setDismissedNow();
        setDismissed(true);
        analytics.track("pwa_install_prompt_dismissed", { source: "not_now" });
      },
      applyUpdate: () => {
        if (!updateWorker) return;
        analytics.track("pwa_update_accepted", {
          displayMode: getDisplayMode(),
        });
        requestSkipWaiting(updateWorker);
        window.location.reload();
      },
    }),
    [online, installed, showInstall, canPrompt, ios, updateWorker, deferredPrompt],
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa(): PwaContextValue {
  const ctx = useContext(PwaContext);
  if (!ctx) {
    throw new Error("usePwa must be used within PwaContextProvider");
  }
  return ctx;
}
