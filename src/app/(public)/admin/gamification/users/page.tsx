"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { listAdminUsers } from "@/lib/api/progress";

export default function AdminUsersPage() {
  const { accessToken, user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const canView = (user?.roles ?? []).some((r) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(r),
  );

  const query = useQuery({
    queryKey: ["admin", "users", search, page],
    queryFn: async () =>
      (
        await listAdminUsers({
          search: search || undefined,
          page,
          pageSize: 20,
          sort: "xp",
        })
      ).data!,
    enabled: Boolean(accessToken && canView),
  });

  if (!accessToken || !canView) {
    return (
      <p className="text-sm text-muted-foreground">Admin access required.</p>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Users</h1>
          <p className="text-sm text-muted-foreground">
            Search and inspect gamification progress.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search email / name"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        />
      </header>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-muted-foreground">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Level</th>
              <th className="px-3 py-2">XP</th>
              <th className="px-3 py-2">Games</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(query.data?.items ?? []).map((u) => (
              <tr key={u.id} className="border-t border-white/10">
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/gamification/users/${u.id}`}
                    className="text-primary hover:underline"
                  >
                    {u.displayName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-3 py-2 text-white">{u.level}</td>
                <td className="px-3 py-2 text-white">{u.totalXp}</td>
                <td className="px-3 py-2 text-white">{u.uniqueGamesPlayed}</td>
                <td className="px-3 py-2 text-white">{u.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={(query.data?.items.length ?? 0) < 20}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
