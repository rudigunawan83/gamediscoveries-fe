"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/common/ErrorState";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors");
  return <ErrorState description={t("pageDescription")} onRetry={reset} />;
}
