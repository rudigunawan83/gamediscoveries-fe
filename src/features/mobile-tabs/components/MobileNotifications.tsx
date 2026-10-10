"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, BellOff, Flag, Flame, MessagesSquare, Trophy, type LucideIcon } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getNotifications, markNotificationsRead } from "@/lib/api/community";
import { cn } from "@/lib/utils";
import { errorMessage } from "./MobileCommunityUi";
import { formatTimeAgo } from "./MobileGameDetail";
import { MobileSubpageHeader } from "./MobileSubpageHeader";
import { MobileGameListSkeleton, MobileMessage, MobilePillTabs } from "./MobileTabUi";

const NOTIFICATIONS_KEY = ["community", "notifications"] as const;

type Notification = {
  id: string;
  type: string;
  message?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  createdAt: string;
  readAt?: string | null;
};

export type NotificationCategory = "achievement" | "mission" | "streak" | "social" | "other";

export function notificationCategory(type: string): NotificationCategory {
  const t = type.toLowerCase();
  if (t.includes("achievement")) return "achievement";
  if (t.includes("mission") || t.includes("challenge")) return "mission";
  if (t.includes("streak")) return "streak";
  if (["comment", "reply", "reaction", "follow", "mention"].some((word) => t.includes(word))) return "social";
  return "other";
}

export function notificationTitle(type: string) {
  const label = type
    .replace(/[_\-.]/g, " ")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
  return label || "Notification";
}

/** Where a notification opens, like the app. */
export function notificationRoute(item: Pick<Notification, "type" | "entityType" | "entityId">) {
  if (item.entityType === "post" && item.entityId) return `/community/post/${encodeURIComponent(item.entityId)}`;
  if (item.entityType === "achievement") return "/achievements";
  return notificationCategory(item.type) === "mission" ? "/missions" : null;
}

const VISUALS: Record<NotificationCategory, [LucideIcon, string]> = {
  achievement: [Trophy, "#ffc83d"],
  mission: [Flag, "#2bd576"],
  streak: [Flame, "#f97316"],
  social: [MessagesSquare, "#3b82f6"],
  other: [Bell, "#8b5cf6"],
};

const TABS: [string, NotificationCategory | null][] = [
  ["All", null],
  ["Achievements", "achievement"],
  ["Missions", "mission"],
];

/** Mirrors the app's Notifications screen. */
export function MobileNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [tab, setTab] = useState(0);
  const [marking, setMarking] = useState(false);
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(new Set());

  const query = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async () => (await getNotifications()).data,
    enabled: Boolean(accessToken),
  });

  const isUnread = (item: Notification) => !item.readAt && !readIds.has(item.id);
  const items: Notification[] = query.data?.items ?? [];
  const unread = query.data ? items.filter(isUnread).length : 0;
  const filter = TABS[tab]![1];
  const visible = filter ? items.filter((item) => notificationCategory(item.type) === filter) : items;

  const open = (item: Notification) => {
    if (isUnread(item)) {
      setReadIds((ids) => new Set(ids).add(item.id));
      markNotificationsRead(item.id)
        .then(() => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }))
        .catch((error: unknown) => {
          setReadIds((ids) => {
            const next = new Set(ids);
            next.delete(item.id);
            return next;
          });
          toast.error(errorMessage(error));
        });
    }
    const route = notificationRoute(item);
    if (route) router.push(route);
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await markNotificationsRead();
      await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setMarking(false);
    }
  };

  return (
    <div>
      <MobileSubpageHeader
        title="Notifications"
        action={
          unread > 0 ? (
            <button
              type="button"
              disabled={marking}
              onClick={() => void markAllRead()}
              className="h-10 shrink-0 px-3 text-sm font-bold text-[#ffc83d] disabled:opacity-50"
            >
              Mark all read
            </button>
          ) : null
        }
      />
      {!accessToken ? (
        <MobileMessage
          icon={Bell}
          title="Stay in the loop"
          message="Sign in to get updates on achievements, missions and replies."
          signIn
        />
      ) : query.isPending ? (
        <MobileGameListSkeleton count={5} />
      ) : query.isError ? (
        <div className="rounded-[18px] border border-[#ff5d73]/40 bg-[#15151d] p-4">
          <p className="text-sm text-[#9c9cb0]">Something went wrong. Please try again.</p>
          <button type="button" onClick={() => void query.refetch()} className="mt-2 text-sm font-bold text-[#ffc83d]">
            Try again
          </button>
        </div>
      ) : (
        <>
          <MobilePillTabs
            label="Notification types"
            labels={TABS.map(([label]) => label)}
            selectedIndex={tab}
            onChange={setTab}
          />
          {visible.length === 0 ? (
            <MobileMessage icon={BellOff} message="You're all caught up." />
          ) : (
            <ul className="space-y-2.5 pb-8 pt-4">
              {visible.map((item) => {
                const [Icon, color] = VISUALS[notificationCategory(item.type)];
                const itemUnread = isUnread(item);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => open(item)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl p-3.5 text-left",
                        itemUnread ? "bg-[#1e1e29]" : "bg-[#17171f]",
                      )}
                    >
                      <span
                        className="grid size-[42px] shrink-0 place-items-center rounded-full"
                        style={{ backgroundColor: `${color}29` }}
                      >
                        <Icon className="size-[22px]" style={{ color }} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-extrabold text-white">{notificationTitle(item.type)}</span>
                        {item.message ? (
                          <span className="mt-0.5 block text-xs text-[#9c9cb0]">{item.message}</span>
                        ) : null}
                        <span className="mt-1 block text-[11px] text-[#6b6b7e]">{formatTimeAgo(item.createdAt)}</span>
                      </span>
                      {itemUnread ? (
                        <span aria-label="Unread" className="ml-2 mt-1.5 size-2 shrink-0 rounded-full bg-[#ffc83d]" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
