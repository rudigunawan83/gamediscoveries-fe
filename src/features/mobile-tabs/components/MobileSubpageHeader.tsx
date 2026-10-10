"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

/** App-style AppBar for screens pushed over the tabs: back arrow + title. */
export function MobileSubpageHeader({
  title,
  icon,
  action,
  fallbackHref = "/profile",
}: {
  title: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  fallbackHref?: string;
}) {
  const router = useRouter();
  const t = useTranslations("Common");

  return (
    <div className="sticky top-0 z-30 -mx-4 -mt-6 mb-2 flex h-14 items-center gap-1 bg-[#0b0b10]/95 px-2 backdrop-blur">
      <button
        type="button"
        aria-label={t("back")}
        onClick={() => {
          if (window.history.length > 1) router.back();
          else router.push(fallbackHref);
        }}
        className="grid size-11 shrink-0 place-items-center rounded-full text-white"
      >
        <ArrowLeft className="size-6" aria-hidden="true" />
      </button>
      {icon}
      {typeof title === "string" ? (
        <h1 className="min-w-0 flex-1 truncate text-xl font-extrabold text-white">{title}</h1>
      ) : (
        <div className="min-w-0 flex-1">{title}</div>
      )}
      {action}
    </div>
  );
}
