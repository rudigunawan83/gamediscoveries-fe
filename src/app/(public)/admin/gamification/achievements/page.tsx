"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getAdminAchievements,
  setAdminAchievementActive,
  type AdminAchievementDefinition,
} from "@/lib/api/achievements";

const categories = [
  "ALL",
  "DISCOVERY",
  "GAMEPLAY",
  "EXPLORATION",
  "COLLECTION",
  "SOCIAL",
  "STREAK",
  "PROGRESSION",
  "SPECIAL",
] as const;

export default function AdminAchievementsPage() {
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();
  const roles = user?.roles ?? [];
  const canView = roles.some((r) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(r),
  );
  const isSuperAdmin = roles.includes("SuperAdmin");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("ALL");
  const [difficulty, setDifficulty] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const listQuery = useQuery({
    queryKey: ["admin", "achievements"],
    queryFn: async () => (await getAdminAchievements()).data!,
    enabled: Boolean(accessToken && canView),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      setAdminAchievementActive(id, active, "admin toggle"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "achievements"],
      });
    },
  });

  const filtered = useMemo(() => {
    const items = listQuery.data?.items ?? [];
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "ALL" && item.category !== category) return false;
      if (difficulty !== "ALL" && item.difficulty !== difficulty) return false;
      if (activeFilter === "ACTIVE" && !item.isActive) return false;
      if (activeFilter === "INACTIVE" && item.isActive) return false;
      if (!q) return true;
      return (
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.requirementType.toLowerCase().includes(q)
      );
    });
  }, [listQuery.data?.items, search, category, difficulty, activeFilter]);

  if (!accessToken || !canView) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary">
          Sign in
        </Link>{" "}
        as admin to manage achievements.
      </p>
    );
  }

  const overview = listQuery.data?.overview;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-white">
          Achievements
        </h1>
        <p className="text-sm text-muted-foreground">
          Catalog, unlock stats, and activation controls.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total", overview?.totalDefinitions],
          ["Active", overview?.activeDefinitions],
          ["Secret", overview?.secretDefinitions],
          ["Unlocks", overview?.totalUnlocks],
          ["Unlocks today", overview?.unlocksToday],
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

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search code, title, requirement…"
          className="min-w-[220px] flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
        />
        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as (typeof categories)[number])
          }
          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
        >
          {["ALL", "EASY", "MEDIUM", "HARD", "EPIC", "LEGENDARY"].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
        >
          <option value="ALL">ALL STATUS</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Difficulty</th>
              <th className="px-3 py-2">Requirement</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">XP</th>
              <th className="px-3 py-2">Unlocks</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <AchievementRow
                key={item.id}
                item={item}
                canToggle={isSuperAdmin}
                busy={toggleMutation.isPending}
                onToggle={(active) =>
                  toggleMutation.mutate({ id: item.id, active })
                }
              />
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  No achievements match the filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AchievementRow({
  item,
  canToggle,
  busy,
  onToggle,
}: {
  item: AdminAchievementDefinition;
  canToggle: boolean;
  busy: boolean;
  onToggle: (active: boolean) => void;
}) {
  return (
    <tr className="border-t border-white/10">
      <td className="px-3 py-2 text-white">
        {item.code}
        {item.isSecret ? (
          <span className="ml-2 text-xs text-amber-300">secret</span>
        ) : null}
      </td>
      <td className="px-3 py-2 text-white">{item.title}</td>
      <td className="px-3 py-2 text-muted-foreground">{item.category}</td>
      <td className="px-3 py-2 text-white">{item.difficulty}</td>
      <td className="px-3 py-2 text-muted-foreground">
        {item.requirementType}
      </td>
      <td className="px-3 py-2 text-white">{item.targetValue}</td>
      <td className="px-3 py-2 text-white">{item.rewardXp}</td>
      <td className="px-3 py-2 text-white">{item.unlockedCount}</td>
      <td className="px-3 py-2 text-white">
        {item.isActive ? "Active" : "Inactive"}
      </td>
      <td className="px-3 py-2">
        {canToggle ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onToggle(!item.isActive)}
          >
            {item.isActive ? "Deactivate" : "Activate"}
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">view only</span>
        )}
      </td>
    </tr>
  );
}
