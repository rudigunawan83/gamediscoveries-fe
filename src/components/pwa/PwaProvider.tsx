"use client";

import type { ReactNode } from "react";
import { InstallAppBanner } from "@/components/pwa/InstallAppBanner";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { PwaUpdatePrompt } from "@/components/pwa/PwaUpdatePrompt";
import { PwaContextProvider } from "@/providers/PwaContext";

export function PwaProvider({ children }: { children: ReactNode }) {
  return (
    <PwaContextProvider>
      {children}
      <OfflineIndicator />
      <InstallAppBanner />
      <PwaUpdatePrompt />
    </PwaContextProvider>
  );
}
