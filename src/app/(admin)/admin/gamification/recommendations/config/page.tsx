"use client";

import Link from "next/link";

export default function AdminRecommendationConfigPage() {
  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs text-muted-foreground">
          <Link href="/admin/gamification/recommendations" className="text-primary">
            ← Recommendations
          </Link>
        </p>
        <h1 className="font-display text-3xl font-bold text-white">
          Recommendation Config
        </h1>
        <p className="text-sm text-muted-foreground">
          Runtime weights live in appsettings <code>Recommendation</code> and
          table <code>recommendation_config</code>. Algorithm version:{" "}
          PERSONALIZED_V1.
        </p>
      </header>

      <ul className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
        <li>PersonalRelevance 30% · Genre/Content 15% · Category/Preference 10%</li>
        <li>Discovery 10% · Trending 5% · Freshness 5% · Novelty 5%</li>
        <li>Engagement 5% · Exploration 5% · Behavior 5%</li>
        <li>MMR λ = 0.80 · Candidate pool ≈ 200 · Cold-start threshold = 3</li>
        <li>Cache TTL for-you / home: 5–15 minutes</li>
      </ul>
    </div>
  );
}