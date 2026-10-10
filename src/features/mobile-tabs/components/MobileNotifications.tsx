"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, type Messages } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, BellOff, Flag, Flame, MessagesSquare, Trophy, type LucideIcon } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getNotifications, markNotificationsRead } from "@/lib/api/community";
import { useFormats } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import { useErrorMessage } from "./MobileCommunityUi";
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

export type NotificationsTranslator = (key: keyof Messages["Notifications"]) => string;

const TYPE_TITLES: Record<string, keyof Messages["Notifications"]> = {
  comment_on_post: "typeCommentOnPost",
  reply_to_comment: "typeReplyToComment",
  user_followed: "typeUserFollowed",
  achievement_unlocked: "typeAchievementUnlocked",
  post_created: "typePostCreated",
};

/** Known API types are translated; unknown ones are humanized like the app. */
export function notificationTitle(t: NotificationsTranslator, type: string) {
  const key = TYPE_TITLES[type.toLowerCase()];
  if (key) return t(key);
  const label = type
    .replace(/[_\-.]/g, " ")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
  return label || t("fallbackTitle");
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

const TABS: [keyof Messages["Notifications"], NotificationCategory | null][] = [
  ["filterAll", null],
  ["filterAchievements", "achievement"],
  ["filterMissions", "mission"],
];

/** Mirrors the app's Notifications screen. */
export function MobileNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [tab, setTab] = useState(0);
  const [marking, setMarking] = useState(false);
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(new Set());
  const { timeAgo } = useFormats();
  const t = useTranslations("Notifications");
  const tNav = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const toErrorMessage = useErrorMessage();

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
          toast.error(toErrorMessage(error));
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
      toast.error(toErrorMessage(error));
    } finally {
      setMarking(false);
    }
  };

  return (
    <div>
      <MobileSubpageHeader
        title={tNav("notifications")}
        action={
          unread > 0 ? (
            <button
              type="button"
              disabled={marking}
              onClick={() => void markAllRead()}
              className="h-10 shrink-0 px-3 text-sm font-bold text-[#ffc83d] disabled:opacity-50"
            >
              {t("markAllRead")}
            </button>
          ) : null
        }
      />
      {!accessToken ? (
        <MobileMessage icon={Bell} title={t("signInTitle")} message={t("signInMessage")} signIn />
      ) : query.isPending ? (
        <MobileGameListSkeleton count={5} />
      ) : query.isError ? (
        <div className="rounded-[18px] border border-[#ff5d73]/40 bg-[#15151d] p-4">
          <p className="text-sm text-[#9c9cb0]">{tCommon("errorGeneric")}</p>
          <button type="button" onClick={() => void query.refetch()} className="mt-2 text-sm font-bold text-[#ffc83d]">
            {tCommon("retry")}
          </button>
        </div>
      ) : (
        <>
          <MobilePillTabs
            label={t("typesLabel")}
            labels={TABS.map(([label]) => t(label))}
            selectedIndex={tab}
            onChange={setTab}
          />
          {visible.length === 0 ? (
            <MobileMessage icon={BellOff} message={t("empty")} />
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
                        <span className="block text-sm font-extrabold text-white">{notificationTitle(t, item.type)}</span>
                        {item.message ? (
                          <span className="mt-0.5 block text-xs text-[#9c9cb0]">{item.message}</span>
                        ) : null}
                        <span className="mt-1 block text-[11px] text-[#6b6b7e]">{timeAgo(item.createdAt)}</span>
                      </span>
                      {itemUnread ? (
                        <span aria-label={t("unread")} className="ml-2 mt-1.5 size-2 shrink-0 rounded-full bg-[#ffc83d]" />
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
