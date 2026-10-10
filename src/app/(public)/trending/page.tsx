import Link from "next/link";
import type { Messages } from "next-intl";
import { getTranslations } from "next-intl/server";
import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import {
  getDiscoveryTrending,
  mapRankingItemToGame,
} from "@/lib/api/discovery-rankings";
import { createMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd } from "@/lib/seo/structured-data";

const TREND_LABELS: Record<string, keyof Messages["Seo"]> = {
  RISING: "trendRising",
  HOT: "trendHot",
  NEW: "trendNew",
  DECLINING: "trendDeclining",
};

export async function generateMetadata() {
  const t = await getTranslations("Seo");
  return createMetadata({
    title: t("trendingTitle"),
    description: t("trendingDescription"),
    path: "/trending",
  });
}

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  const [ranking, t, tDiscovery] = await Promise.all([
    getDiscoveryTrending(24, "24h").then((response) => response.data),
    getTranslations("Seo"),
    getTranslations("Discovery"),
  ]);
  const games = (ranking?.items ?? []).map(mapRankingItemToGame);

  return (
    <div className="space-y-10">
      <JsonLd data={itemListJsonLd(t("trendingHeading"), "/trending", games)} />
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("trendingHeading")}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {t("trendingDescription")} {t("trendingIntro")}
        </p>
      </header>

      {(ranking?.items?.length ?? 0) > 0 ? (
        <ol className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          {ranking!.items.slice(0, 8).map((item) => (
            <li
              key={item.game.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 py-2 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-bold text-white">
                  #{item.rank}
                </span>
                <Link
                  href={`/game/${item.game.slug}`}
                  className="text-sm text-white hover:underline"
                >
                  {item.game.title}
                </Link>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{t(TREND_LABELS[item.trend] ?? "trendPopular")}</span>
                <span>
                  {item.rankChange > 0
                    ? `↑ ${item.rankChange}`
                    : item.rankChange < 0
                      ? `↓ ${Math.abs(item.rankChange)}`
                      : "—"}
                </span>
                <span>{item.score.toFixed(1)}</span>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      <GameSection
        title={t("trendingSectionTitle")}
        description={t("trendingSectionDescription")}
        games={games}
        variant="discovery"
      />
      <SeoRelatedLinks
        links={[
          { href: "/rising", label: t("linkRising") },
          { href: "/most-popular", label: t("linkPopularGames") },
          { href: "/new", label: tDiscovery("linkNewDiscoveries") },
          { href: "/games", label: t("linkAllGames") },
        ]}
      />
    </div>
  );
}
