"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analytics } from "@/lib/analytics/client";

let lastTrackedPath: string | null = null;

/** Sends one PAGE_VIEW per client-side route change. */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === lastTrackedPath) return;
    lastTrackedPath = pathname;
    analytics.pageView(pathname);
  }, [pathname]);

  return null;
}

export function resetPageViewTrackerForTests() {
  lastTrackedPath = null;
}
