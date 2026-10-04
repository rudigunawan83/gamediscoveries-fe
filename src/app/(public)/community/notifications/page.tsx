"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getNotifications,
  markNotificationsRead,
} from "@/lib/api/community";

export default function NotificationsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["community", "notifications"],
    queryFn: async () => (await getNotifications()).data,
    enabled: Boolean(accessToken),
  });

  const markRead = useMutation({
    mutationFn: () => markNotificationsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["community", "notifications"],
      });
    },
  });

  if (!accessToken) {
    return (
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold text-white">
          Notifications
        </h1>
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-primary">
            Sign in
          </Link>{" "}
          to view community notifications.
        </p>
      </div>
    );
  }

  const items = notificationsQuery.data?.items ?? [];
  const unread = notificationsQuery.data?.unread ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">{unread} unread</p>
        </div>
        <Button
          variant="outline"
          disabled={markRead.isPending || unread === 0}
          onClick={() => markRead.mutate()}
        >
          Mark all as read
        </Button>
      </header>

      <div className="space-y-2">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm"
          >
            <p className="text-white">
              {item.message || item.type.replaceAll("_", " ")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleString()}
              {item.readAt ? "" : " · unread"}
            </p>
          </article>
        ))}
        {!notificationsQuery.isPending && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        ) : null}
      </div>
    </div>
  );
}
