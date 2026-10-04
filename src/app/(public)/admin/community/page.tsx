"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { listAdminReports, moderateCommunity } from "@/lib/api/community";
import Link from "next/link";

export default function AdminCommunityPage() {
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();
  const roles = user?.roles ?? [];
  const canModerate = roles.some((role) =>
    ["Moderator", "Admin", "SuperAdmin"].includes(role),
  );

  const reportsQuery = useQuery({
    queryKey: ["admin", "community", "reports"],
    queryFn: async () => (await listAdminReports("pending")).data ?? [],
    enabled: Boolean(accessToken && canModerate),
  });

  const moderateMutation = useMutation({
    mutationFn: (body: {
      action: string;
      targetType: string;
      targetId: string;
    }) => moderateCommunity(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "community", "reports"],
      });
    },
  });

  if (!accessToken) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary">
          Sign in
        </Link>{" "}
        as a moderator to manage community reports.
      </p>
    );
  }

  if (!canModerate) {
    return (
      <p className="text-sm text-muted-foreground">
        Moderator or admin role required.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">
          Admin · Community
        </h1>
        <p className="text-sm text-muted-foreground">
          Report queue and moderation actions.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-white">
          Report Queue
        </h2>
        {(reportsQuery.data ?? []).map((report) => (
          <article
            key={report.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-sm text-white">
              {report.reason} · {report.targetType} · {report.targetId}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {report.status} · {new Date(report.createdAt).toLocaleString()}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {report.targetType === "post" ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={moderateMutation.isPending}
                  onClick={() =>
                    moderateMutation.mutate({
                      action: "hide",
                      targetType: "post",
                      targetId: report.targetId,
                    })
                  }
                >
                  Hide post
                </Button>
              ) : null}
              {["post", "comment", "review"].includes(report.targetType) ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={moderateMutation.isPending}
                  onClick={() =>
                    moderateMutation.mutate({
                      action: "delete",
                      targetType: report.targetType,
                      targetId: report.targetId,
                    })
                  }
                >
                  Delete
                </Button>
              ) : null}
              <Button
                size="sm"
                disabled={moderateMutation.isPending}
                onClick={() =>
                  moderateMutation.mutate({
                    action: "resolve",
                    targetType: "report",
                    targetId: report.id,
                  })
                }
              >
                Resolve
              </Button>
            </div>
          </article>
        ))}
        {!reportsQuery.isPending && (reportsQuery.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No pending reports.</p>
        ) : null}
      </section>
    </div>
  );
}
