"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwa } from "@/hooks/usePwa";

export function InstallAppButton({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { showInstall, canPrompt, promptInstall, isIosDevice, installed } =
    usePwa();

  if (installed || (!showInstall && !canPrompt)) return null;
  if (!canPrompt && !isIosDevice) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "sm" : "default"}
      className={className}
      onClick={() => {
        if (canPrompt) {
          void promptInstall();
          return;
        }
        // iOS guidance is handled by the banner.
      }}
      aria-label="Install GameDiscoveries"
    >
      <Download className="size-4" aria-hidden="true" />
      {compact ? "Install" : "Install GameDiscoveries"}
    </Button>
  );
}
