"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePwa } from "@/hooks/usePwa";

export function PwaUpdatePrompt() {
  const { updateAvailable, applyUpdate } = usePwa();
  const pathname = usePathname();
  const t = useTranslations("Pwa");
  const playing = pathname.includes("/play");

  if (!updateAvailable || playing) return null;

  return (
    <div
      className="fixed inset-x-0 z-[60] flex justify-center px-3"
      style={{ top: "calc(0.75rem + env(safe-area-inset-top))" }}
    >
      <div className="flex max-w-md items-center gap-3 rounded-full border border-primary/30 bg-[#12151d]/95 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-xl">
        <span>{t("updated")}</span>
        <Button size="sm" className="min-h-10 rounded-full" onClick={applyUpdate}>
          {t("reload")}
        </Button>
      </div>
    </div>
  );
}
