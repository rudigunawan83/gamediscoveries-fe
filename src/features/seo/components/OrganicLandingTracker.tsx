"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics/client";

function isOrganicReferrer(referrer: string): boolean {
  if (!referrer) return false;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    return (
      host.includes("google.") ||
      host.includes("bing.") ||
      host.includes("duckduckgo.") ||
      host.includes("yahoo.") ||
      host.includes("yandex.")
    );
  } catch {
    return false;
  }
}

/**
 * Fires organic_landing once per landing session when traffic looks organic.
 * Does not collect unnecessary PII.
 */
export function OrganicLandingTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const key = "gd_organic_landing_tracked";
    if (sessionStorage.getItem(key) === "1") return;

    const params = new URLSearchParams(searchParams?.toString() ?? "");
    const utmMedium = params.get("utm_medium")?.toLowerCase() ?? "";
    const utmSource = params.get("utm_source")?.toLowerCase() ?? "";
    const organicUtm =
      utmMedium === "organic" ||
      utmSource.includes("google") ||
      utmSource.includes("bing");
    const organicRef = isOrganicReferrer(document.referrer);

    if (!organicUtm && !organicRef) return;

    sessionStorage.setItem(key, "1");
    analytics.track("organic_landing", {
      landingPage: pathname,
      source: utmSource || (organicRef ? "organic_search" : "unknown"),
      medium: utmMedium || "organic",
      campaign: params.get("utm_campaign"),
      referrerHost: (() => {
        try {
          return document.referrer
            ? new URL(document.referrer).hostname
            : undefined;
        } catch {
          return undefined;
        }
      })(),
    });
  }, [pathname, searchParams]);

  return null;
}
