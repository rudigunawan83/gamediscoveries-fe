"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getAdminRecommendationOverview } from "@/lib/api/recommendations";

export default function AdminRecommendationsPage() {
  const { accessToken, user } = useAuth();
  const roles = user?.roles ?? [];
  const canView = roles.some((r) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(r),
  );

  const overviewQuery = useQuery({
    queryKey: ["admin", "recommendations", "overview"],
    queryFn: async () => (await getAdminRecommendationOverview()).data!,
    enabled: Boolean(accessToken && canView),
  });

  if (!accessToken || !canView) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary">
          Sign in
        </Link>{" "}
        as admin to view recommendation metrics.
      </p>
    );
  }

  const o = overviewQuery.data;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-white">
          Recommendations
        </h1>
        <p className="text-sm text-muted-foreground">
          Personalized recommendation performance (PERSONALIZED_V1).
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Requests", o?.requests],
          ["Impressions", o?.impressions],
          ["Clicks", o?.clicks],
          ["CTR %", o?.ctr],
          ["Feedback", o?.feedbackCount],
          ["Personalized %", o?.personalizedShare],
          [
            "Last request",
            o?.lastRequestAt
              ? new Date(o.lastRequestAt).toLocaleString()
              : "—",
          ],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">
              {value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
        Strategies: COLD_START, PERSONALIZED, BECAUSE_YOU_PLAYED,
        TRENDING_FOR_YOU, NEW_FOR_YOU, EXPLORATION, FALLBACK_TRENDING. Discovery
        Score & Trending from Phase 08 are consumed as ranking signals.
      </section>
    </div>
  );
}
