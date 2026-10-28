"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { listAuditLogs } from "@/lib/api/progress";

export default function AdminAuditLogsPage() {
  const { accessToken, user } = useAuth();
  const canView = (user?.roles ?? []).some((r) =>
    ["Admin", "SuperAdmin"].includes(r),
  );

  const query = useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: async () => (await listAuditLogs({ limit: 100 })).data!.items,
    enabled: Boolean(accessToken && canView),
  });

  if (!accessToken || !canView) {
    return (
      <p className="text-sm text-muted-foreground">Admin access required.</p>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-bold text-white">
          Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground">
          Append-only admin gamification actions.
        </p>
      </header>
      <ul className="space-y-2">
        {(query.data ?? []).map((log) => (
          <li
            key={log.id}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
          >
            <p className="text-white">
              {log.action} · {log.targetType}/{log.targetId}
            </p>
            <p className="text-xs text-muted-foreground">
              {log.reason || "—"} · {new Date(log.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
