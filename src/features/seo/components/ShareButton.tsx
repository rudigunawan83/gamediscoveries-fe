"use client";

import { useState } from "react";
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
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    analytics.track("share_clicked", {
      entityType,
      entityId,
      url,
    });

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text, url });
        analytics.track("share_completed", {
          entityType,
          entityId,
          method: "web_share",
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      analytics.track("share_completed", {
        entityType,
        entityId,
        method: "clipboard",
      });
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
      aria-label={iconOnly ? (copied ? "Link copied" : "Share") : undefined}
      className={className}
      onClick={() => void handleShare()}
    >
      <Share2 className={iconOnly ? "size-5" : "size-4"} aria-hidden="true" />
      {iconOnly ? null : copied ? "Link copied" : "Share"}
    </Button>
  );
}
