"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  formatCountdown,
  getMyMissions,
  type MissionDto,
} from "@/lib/api/missions";

function MissionCard({ mission }: { mission: MissionDto }) {
  const completed = mission.status === "COMPLETED";
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-white">
            {mission.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {mission.description}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-emerald-400">
          +{mission.rewardXp} XP
        </p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all"
            style={{ width: `${Math.min(100, mission.percentage)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {mission.progress} / {mission.target}
          </span>
          {completed ? (
            <span className="font-semibold text-emerald-400">✓ COMPLETED</span>
          ) : (
            <span>{mission.percentage}%</span>
          )}
        </div>
      </div>
    </article>
  );
}

export function MissionsPageView() {
  const { accessToken } = useAuth();
  const [tick, setTick] = useState(0);

  const query = useQuery({
    queryKey: ["me", "missions"],
    queryFn: async () => (await getMyMissions()).data!,
    enabled: Boolean(accessToken),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!accessToken) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary">
          Sign in
        </Link>{" "}
        to view missions.
      </p>
    );
  }

  if (query.isPending) {
    return <p className="text-sm text-muted-foreground">Loading missions…</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p className="text-sm text-muted-foreground">
        Unable to load missions right now.
      </p>
    );
  }

  const data = query.data;
  void tick;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">Missions</h1>
        <p className="text-sm text-muted-foreground">
          Daily missions and weekly challenges · {data.timeZone}
        </p>
        <Button asChild variant="ghost" size="sm">
          <Link href="/progress">Back to Progress</Link>
        </Button>
      </header>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold text-white">
            Daily Missions
          </h2>
          <p className="text-xs text-muted-foreground">
            Resets in {formatCountdown(data.dailyExpiresAt)}
          </p>
        </div>
        <div className="space-y-3">
          {data.daily.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
          {data.daily.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No daily missions assigned yet.
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold text-white">
            Weekly Challenges
          </h2>
          <p className="text-xs text-muted-foreground">
            Resets in {formatCountdown(data.weeklyExpiresAt)}
          </p>
        </div>
        <div className="space-y-3">
          {data.weekly.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
          {data.weekly.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No weekly challenges assigned yet.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
