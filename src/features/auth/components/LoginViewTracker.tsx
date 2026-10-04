"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics/client";

export function LoginViewTracker() {
  useEffect(() => {
    analytics.track("auth_login_viewed", { method: "password" });
  }, []);

  return null;
}
