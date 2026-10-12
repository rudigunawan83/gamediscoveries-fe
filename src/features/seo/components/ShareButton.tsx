"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics/client";

type ShareButtonProps = {
  title: string;
  text?: string;
  url: string;
  entityType: "game" | "collection" | "community";
  entityId?: string;
  iconOnly?: boolean;
  className?: string;
};

export function ShareButton({
  title,
  text,
  url,
  entityType,
  entityId,
  iconOnly = false,
  className,
}: ShareButtonProps) {
  const t = useTranslations("Common");
  const [copied, setCopied] = useState(false);
  const label = copied ? t("linkCopied") : t("share");

  // GAME_SHARED is a per-game metric; other entities have no first-party share event.
  function trackShared(method: string) {
    if (entityType !== "game" || !entityId) return;
    analytics.track("share_completed", { gameId: entityId, method });
  }

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text, url });
        trackShared("web_share");
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackShared("clipboard");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // User cancelled share sheet — ignore.
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={iconOnly ? "icon" : "default"}
      aria-label={iconOnly ? label : undefined}
      className={className}
      onClick={() => void handleShare()}
    >
      <Share2 className={iconOnly ? "size-5" : "size-4"} aria-hidden="true" />
      {iconOnly ? null : label}
    </Button>
  );
}
