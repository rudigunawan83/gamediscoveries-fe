import { useTranslations } from "next-intl";

export function GamePlayerLoading() {
  const t = useTranslations("Player");
  const tCommon = useTranslations("Common");
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex size-full min-h-[16rem] flex-col items-center justify-center gap-3 bg-[#060914] text-center text-[#ffe8c2]"
    >
      <span className="sr-only">{t("loadingGame")}</span>
      <div
        className="size-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
        aria-hidden="true"
      />
      <p className="font-display text-lg font-semibold text-white">{tCommon("loading")}</p>
      <p className="text-sm text-muted-foreground">{t("preparing")}</p>
    </div>
  );
}
