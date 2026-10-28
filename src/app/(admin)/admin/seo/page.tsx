"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getGames } from "@/lib/api/games";
import { getCategories } from "@/lib/api/categories";
import { CURATED_COLLECTIONS } from "@/features/seo/data/collections";
import { detectOrphanPages } from "@/features/seo/utils/orphan";
import { detectSeoOpportunities } from "@/features/seo/utils/opportunities";
import { mapGameSummaries } from "@/features/games/mappers/game.mapper";
import { scoreGameSeo } from "@/lib/seo/quality-score";
import { SEO_CONFIG } from "@/lib/seo/config";
import { ROBOTS_DISALLOW } from "@/lib/seo/robots-rules";

export default function AdminSeoPage() {
  const { accessToken, user } = useAuth();
  const roles = user?.roles ?? [];
  const canView = roles.some((role) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(role),
  );

  const gamesQuery = useQuery({
    queryKey: ["admin", "seo", "games"],
    queryFn: async () => {
      const response = await getGames({ page: 1, pageSize: 100, sort: "newest" });
      return mapGameSummaries(response.data ?? []);
    },
    enabled: Boolean(accessToken && canView),
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin", "seo", "categories"],
    queryFn: async () => (await getCategories()).data ?? [],
    enabled: Boolean(accessToken && canView),
  });

  if (!accessToken) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary">
          Sign in
        </Link>{" "}
        as an admin to view SEO health.
      </p>
    );
  }

  if (!canView) {
    return (
      <p className="text-sm text-muted-foreground">
        Moderator or admin role required.
      </p>
    );
  }

  const games = gamesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const thinGames = games.filter((g) => scoreGameSeo(g) < 50);
  const opportunities = detectSeoOpportunities(games);
  const orphanReport = detectOrphanPages([
    ...games.slice(0, 40).map((g) => ({
      path: `/game/${g.slug}`,
      indexable: true,
      linkedFrom: g.categories[0]
        ? [`/games/${g.categories[0].slug}`, "/games"]
        : ["/games"],
    })),
    ...categories.map((c) => ({
      path: `/games/${c.slug}`,
      indexable: c.gameCount >= SEO_CONFIG.minGamesForCategoryIndexing,
      linkedFrom: ["/", "/games", "/collections"],
    })),
    ...CURATED_COLLECTIONS.map((c) => ({
      path: `/collections/${c.slug}`,
      indexable: true,
      linkedFrom: ["/collections", "/"],
    })),
  ]);
  const orphans = orphanReport.filter((r) => r.status === "orphan");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/community" className="text-primary hover:underline">
            Community admin
          </Link>
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          SEO Health
        </h1>
        <p className="text-muted-foreground">
          Internal diagnostics only — not a Google ranking score. No bulk
          production SEO mutations from this panel.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Sampled games" value={games.length} />
        <Metric label="Categories" value={categories.length} />
        <Metric label="Thin games" value={thinGames.length} />
        <Metric label="Orphan flags" value={orphans.length} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Configuration</h2>
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>Min games/category: {SEO_CONFIG.minGamesForCategoryIndexing}</li>
          <li>Min games/collection: {SEO_CONFIG.minGamesForCollectionIndexing}</li>
          <li>Games-like enabled: {String(SEO_CONFIG.enableGamesLike)}</li>
          <li>Locales: {SEO_CONFIG.supportedLocales.join(", ")}</li>
          <li>Sitemap partition size: {SEO_CONFIG.sitemapGamesPerPartition}</li>
          <li>Robots disallow: {ROBOTS_DISALLOW.join(", ")}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Opportunities</h2>
        {opportunities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No high-priority issues in sample.</p>
        ) : (
          <ul className="space-y-2">
            {opportunities.slice(0, 20).map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{item.target}</span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {item.severity} · {item.kind}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{item.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Orphan pages</h2>
        {orphans.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No orphan indexable pages detected in the current sample.
          </p>
        ) : (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {orphans.map((item) => (
              <li key={item.page}>
                {item.page} · incoming {item.incomingLinks}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Quick links
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/sitemap.xml" className="text-primary hover:underline">
            Sitemap
          </Link>
          <Link href="/robots.txt" className="text-primary hover:underline">
            robots.txt
          </Link>
          <Link href="/collections" className="text-primary hover:underline">
            Collections
          </Link>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 px-4 py-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
