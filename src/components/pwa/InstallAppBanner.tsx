"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePwa } from "@/hooks/usePwa";
import { analytics } from "@/lib/analytics/client";
import { getDisplayMode } from "@/lib/pwa/detection";

export function InstallAppBanner() {
  const {
    showInstall,
    canPrompt,
    isIosDevice,
    promptInstall,
    dismissInstall,
  } = usePwa();
  const t = useTranslations("Pwa");

  useEffect(() => {
    if (!showInstall) return;
    analytics.track("pwa_install_prompt_shown", {
      source: "banner",
      displayMode: getDisplayMode(),
      ios: isIosDevice,
    });
  }, [showInstall, isIosDevice]);

  if (!showInstall) return null;

  return (
    <div
      className="fixed inset-x-0 z-50 px-3 lg:hidden"
      style={{
        bottom: "calc(4.25rem + env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-primary/25 bg-[#12151d]/95 p-3 shadow-lg backdrop-blur-xl">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold text-white">
            {t("installTitle")}
          </p>
          <p className="text-xs text-muted-foreground">
            {isIosDevice && !canPrompt ? t("installIosHint") : t("installHint")}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          {canPrompt ? (
            <Button
              size="sm"
              className="min-h-11"
              onClick={() => {
                void promptInstall();
              }}
            >
              {t("install")}
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            className="min-h-11"
            onClick={dismissInstall}
          >
            {t("notNow")}
          </Button>
        </div>
      </div>
    </div>
  );
}
