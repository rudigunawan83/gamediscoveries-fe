import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("offlineTitle"),
    description: t("offlineDescription"),
    path: "/offline",
    noIndex: true,
  });
}

export default async function OfflinePage() {
  const [t, tCommon, tNav] = await Promise.all([
    getTranslations("Seo"),
    getTranslations("Common"),
    getTranslations("Nav"),
  ]);
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center gap-6 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-center">
      <BrandLogo size="lg" href="/" />
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">
          {t("offlineHeading")}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          {t("offlineMessage")}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="min-h-11 min-w-28">
          <Link href="/">{tCommon("retry")}</Link>
        </Button>
        <Button asChild variant="outline" className="min-h-11 min-w-28">
          <Link href="/my-games">{tNav("myGames")}</Link>
        </Button>
      </div>
    </main>
  );
}
