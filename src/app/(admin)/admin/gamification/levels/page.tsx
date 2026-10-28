"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { listLevels, setLevelActive } from "@/lib/api/progress";

export default function AdminLevelsPage() {
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();
  const canView = (user?.roles ?? []).some((r) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(r),
  );
  const isSuperAdmin = (user?.roles ?? []).includes("SuperAdmin");

  const query = useQuery({
    queryKey: ["admin", "levels"],
    queryFn: async () => (await listLevels(true)).data!.items,
    enabled: Boolean(accessToken && canView),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ level, active }: { level: number; active: boolean }) =>
      setLevelActive(level, active),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "levels"] });
    },
  });

  if (!accessToken || !canView) {
    return (
      <p className="text-sm text-muted-foreground">Admin access required.</p>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-bold text-white">Levels</h1>
        <p className="text-sm text-muted-foreground">
          Centralized XP requirements and titles.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Level</th>
              <th className="px-3 py-2">Required XP</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(query.data ?? []).map((level) => (
              <tr key={level.level} className="border-t border-white/10">
                <td className="px-3 py-2 text-white">{level.level}</td>
                <td className="px-3 py-2 text-white">
                  {level.requiredTotalXp.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-white">{level.title}</td>
                <td className="px-3 py-2 text-white">
                  {level.isActive ? "Active" : "Inactive"}
                </td>
                <td className="px-3 py-2">
                  {isSuperAdmin ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        toggleMutation.mutate({
                          level: level.level,
                          active: !level.isActive,
                        })
                      }
                    >
                      {level.isActive ? "Deactivate" : "Activate"}
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
