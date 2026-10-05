"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getMissionAnalytics,
  listMissionTemplates,
  setMissionTemplateActive,
} from "@/lib/api/missions";

export default function AdminMissionsPage() {
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();
  const roles = user?.roles ?? [];
  const canView = roles.some((r) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(r),
  );
  const isSuperAdmin = roles.includes("SuperAdmin");

  const templatesQuery = useQuery({
    queryKey: ["admin", "missions", "templates"],
    queryFn: async () => (await listMissionTemplates()).data!.items,
    enabled: Boolean(accessToken && canView),
  });

  const analyticsQuery = useQuery({
    queryKey: ["admin", "missions", "analytics"],
    queryFn: async () => (await getMissionAnalytics()).data!,
    enabled: Boolean(accessToken && canView),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      setMissionTemplateActive(id, active),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "missions", "templates"],
      });
    },
  });

  if (!accessToken || !canView) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary">
          Sign in
        </Link>{" "}
        as admin to manage missions.
      </p>
    );
  }

  const analytics = analyticsQuery.data;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-white">
          Mission Templates
        </h1>
        <p className="text-sm text-muted-foreground">
          Daily missions and weekly challenges.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Assigned", analytics?.assigned],
          ["Completed", analytics?.completed],
          ["Completion %", analytics?.completionRate],
          ["XP awarded", analytics?.xpAwarded],
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

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Requirement</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">XP</th>
              <th className="px-3 py-2">Difficulty</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(templatesQuery.data ?? []).map((t) => (
              <tr key={t.id} className="border-t border-white/10">
                <td className="px-3 py-2 text-white">{t.code}</td>
                <td className="px-3 py-2 text-white">{t.type}</td>
                <td className="px-3 py-2 text-white">{t.title}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {t.requirementType}
                </td>
                <td className="px-3 py-2 text-white">{t.targetValue}</td>
                <td className="px-3 py-2 text-white">{t.rewardXp}</td>
                <td className="px-3 py-2 text-white">{t.difficulty}</td>
                <td className="px-3 py-2 text-white">
                  {t.isActive ? "Active" : "Inactive"}
                </td>
                <td className="px-3 py-2">
                  {isSuperAdmin ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: t.id,
                          active: !t.isActive,
                        })
                      }
                    >
                      {t.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
