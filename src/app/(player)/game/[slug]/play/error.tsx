"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function GamePlayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Player");
  const tCommon = useTranslations("Common");
  const tLibrary = useTranslations("Library");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#060914] px-6 text-center"
    >
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-white">{t("errorTitle")}</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {t("errorMessage")}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset} className="bg-brand-gradient text-[#1a1205]">
          {tCommon("retry")}
        </Button>
        <Button asChild variant="outline">
          <Link href="/games">{tLibrary("exploreGames")}</Link>
        </Button>
      </div>
    </div>
  );
}
