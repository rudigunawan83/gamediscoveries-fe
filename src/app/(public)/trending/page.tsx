import Link from "next/link";
import { GameSection } from "@/components/game/GameSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoRelatedLinks } from "@/features/seo/components/SeoRelatedLinks";
import {
  getDiscoveryTrending,
  mapRankingItemToGame,
  trendBadge,
} from "@/lib/api/discovery-rankings";
import { createMetadata } from "@/lib/seo/metadata";
import { discoveryPageDescription } from "@/lib/seo/descriptions";
import { itemListJsonLd } from "@/lib/seo/structured-data";

export const metadata = createMetadata({
  title: "Trending Games — Play Free Online",
  description: discoveryPageDescription("trending"),
  path: "/trending",
});

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  const ranking = (await getDiscoveryTrending(24, "24h")).data;
  const games = (ranking?.items ?? []).map(mapRankingItemToGame);

  return (
    <div className="space-y-10">
      <JsonLd data={itemListJsonLd("Trending Games", "/trending", games)} />
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Trending Games
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {discoveryPageDescription("trending")} Rankings use GameDiscoveries
          Discovery Score — recent engagement, momentum, and quality.
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
                <span>{trendBadge(item.trend)}</span>
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
        title="Trending now"
        description="Games gaining attention across GameDiscoveries right now."
        games={games}
        variant="discovery"
      />
      <SeoRelatedLinks
        links={[
          { href: "/rising", label: "Rising games" },
          { href: "/most-popular", label: "Popular games" },
          { href: "/new", label: "New discoveries" },
          { href: "/games", label: "All games" },
        ]}
      />
    </div>
  );
}
