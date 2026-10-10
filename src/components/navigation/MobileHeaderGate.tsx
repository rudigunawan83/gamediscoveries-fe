"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Home has its own greeting header on phones, like the app's Home tab. */
export function MobileHeaderGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname === "/" ? null : children;
}
