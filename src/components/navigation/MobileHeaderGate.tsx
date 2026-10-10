"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { mobileBottomNavItems } from "@/components/navigation/nav-config";

const TAB_PATHS = new Set<string>(mobileBottomNavItems.map((item) => item.href));

/** Bottom-nav tabs render their own app-style header on phones. */
export function MobileHeaderGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return TAB_PATHS.has(pathname) ? null : children;
}
