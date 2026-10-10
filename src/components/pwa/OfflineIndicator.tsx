"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePwa } from "@/hooks/usePwa";

export function OfflineIndicator() {
  const { online } = usePwa();
  const t = useTranslations("Pwa");
  if (online) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 z-[55] flex justify-center px-3"
      style={{ top: "calc(0.5rem + env(safe-area-inset-top))" }}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-warning/40 bg-[#1a1408]/95 px-3 py-2 text-xs text-[#ffe8c2] shadow-lg backdrop-blur-xl">
        <WifiOff className="size-3.5" aria-hidden="true" />
        <span>{t("offline")}</span>
        <Link href="/offline" className="underline underline-offset-2">
          {t("offlineDetails")}
        </Link>
      </div>
    </div>
  );
}
