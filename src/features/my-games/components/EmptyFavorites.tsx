import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function EmptyFavorites() {
  const t = useTranslations("Library");
  return (
    <section
      className="rounded-3xl border border-border/50 bg-card/40 px-6 py-14 text-center"
      aria-labelledby="empty-favorites-title"
    >
      <h2
        id="empty-favorites-title"
        className="font-display text-2xl font-semibold text-white"
      >
        {t("favoritesEmptyTitle")}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {t("favoritesEmptyDesktop")}
      </p>
      <Button asChild className="mt-6 bg-brand-gradient text-[#1a1205]">
        <Link href="/games">{t("exploreGames")}</Link>
      </Button>
    </section>
  );
}
