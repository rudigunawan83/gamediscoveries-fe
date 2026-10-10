"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations, type Messages } from "next-intl";
import {
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  ClipboardCheck,
  Gamepad2,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  MobileNotifications,
  notificationTitle,
  type NotificationsTranslator,
} from "@/features/mobile-tabs/components/MobileNotifications";
import { useFormats } from "@/lib/i18n/format";
import {
  getNotifications,
  markNotificationsRead,
} from "@/lib/api/community";
import {
  categoryFor,
  notificationHref,
} from "@/features/notifications/utils/notificationHref";
import { countThisWeek } from "@/features/notifications/utils/countThisWeek";

type NotificationItem = {
  id: string;
  type: string;
  message?: string;
  entityType?: string | null;
  entityId?: string | null;
  createdAt: string;
  readAt?: string | null;
};

type NotificationsData = { items: NotificationItem[]; unread: number };

const NOTIFICATIONS_KEY = ["community", "notifications"] as const;

const FILTERS = [
  { id: "all", label: "filterAll", longLabel: "filterAllLong" },
  { id: "achievements", label: "filterAchievements", longLabel: "filterAchievements" },
  { id: "missions", label: "filterMissions", longLabel: "filterMissions" },
  { id: "leaderboard", label: "filterLeaderboard", longLabel: "filterLeaderboard" },
  { id: "games", label: "filterGames", longLabel: "filterGames" },
  { id: "system", label: "filterSystem", longLabel: "filterSystem" },
] as const satisfies readonly {
  id: string;
  label: keyof Messages["Notifications"];
  longLabel: keyof Messages["Notifications"];
}[];

function metaFor(type: string): {
  icon: ReactNode;
  tone: string;
  rail: string;
} {
  const category = categoryFor(type);
  if (category === "achievements") {
    return {
      icon: <ShieldCheck className="h-8 w-8 text-white" />,
      tone: "from-violet-500 to-purple-900",
      rail: "bg-violet-400",
    };
  }
  if (category === "missions") {
    return {
      icon: <ClipboardCheck className="h-8 w-8 text-white" />,
      tone: "from-emerald-400 to-teal-800",
      rail: "bg-emerald-400",
    };
  }
  if (category === "leaderboard") {
    return {
      icon: <Trophy className="h-8 w-8 text-white" />,
      tone: "from-amber-300 to-orange-700",
      rail: "bg-amber-300",
    };
  }
  if (category === "games") {
    return {
      icon: <Gamepad2 className="h-8 w-8 text-white" />,
      tone: "from-sky-400 to-blue-800",
      rail: "bg-sky-400",
    };
  }
  return {
    icon: <Settings className="h-8 w-8 text-white" />,
    tone: "from-slate-400 to-slate-800",
    rail: "bg-slate-400",
  };
}

function titleAndBody(t: NotificationsTranslator, item: NotificationItem) {
  const text = item.message || notificationTitle(t, item.type);
  const [first, ...rest] = text.split(/[:.!?]\s+/);
  return {
    title: first || text,
    body: rest.join(". ") || text,
  };
}

function NotificationCard({
  item,
  unread,
  onOpen,
}: {
  item: NotificationItem;
  unread: boolean;
  onOpen: (item: NotificationItem) => void;
}) {
  const t = useTranslations("Notifications");
  const { timeAgo } = useFormats();
  const meta = metaFor(item.type);
  const content = titleAndBody(t, item);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onOpen(item);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={unread ? t("cardUnreadLabel", { title: content.title }) : content.title}
      onClick={() => onOpen(item)}
      onKeyDown={onKeyDown}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 shadow-lg shadow-black/10 outline-none transition hover:border-amber-300/25 hover:bg-white/[0.055] focus-visible:ring-2 focus-visible:ring-amber-300 ${
        unread ? "border-amber-300/20 bg-slate-900/90" : "border-white/10 bg-slate-950/75"
      }`}
    >
      <div className={`absolute bottom-0 left-0 top-0 w-1 ${meta.rail}`} />
      <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${meta.tone} shadow-xl shadow-black/30`}>
          {meta.icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-base font-black text-white">{content.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-400">{content.body}</p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <p className="text-xs text-slate-400">{timeAgo(item.createdAt)}</p>
          <span className={`h-3 w-3 rounded-full ${unread ? "bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.8)]" : "border border-slate-500"}`} />
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-slate-300 transition group-hover:bg-amber-300 group-hover:text-slate-950">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-3">
        <div className="text-amber-200">{icon}</div>
        <div>
          <p className="font-display text-2xl font-black text-white">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <>
      <div className="mx-auto max-w-xl lg:hidden">
        <MobileNotifications />
      </div>
      <div className="hidden lg:block">
        <DesktopNotifications />
      </div>
    </>
  );
}

function DesktopNotifications() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const t = useTranslations("Notifications");
  const tNav = useTranslations("Nav");

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async (): Promise<NotificationsData> => (await getNotifications()).data,
    enabled: Boolean(accessToken),
  });

  const markRead = useMutation({
    mutationFn: () => markNotificationsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });

  const markOneRead = useMutation({
    mutationFn: (id: string) => markNotificationsRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previous = queryClient.getQueryData<NotificationsData>(NOTIFICATIONS_KEY);
      queryClient.setQueryData<NotificationsData>(NOTIFICATIONS_KEY, (old) =>
        old
          ? {
              unread: Math.max(0, old.unread - 1),
              items: old.items.map((item) =>
                item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
              ),
            }
          : old,
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });

  const items = useMemo(() => notificationsQuery.data?.items ?? [], [notificationsQuery.data]);
  const isUnread = (item: NotificationItem) => !item.readAt;
  const unreadCount = notificationsQuery.data?.unread ?? 0;

  const openNotification = (item: NotificationItem) => {
    if (isUnread(item)) markOneRead.mutate(item.id);
    const href = notificationHref(item);
    if (href) router.push(href);
  };
  const filteredItems = useMemo(
    () =>
      activeFilter === "all"
        ? items
        : items.filter((item) => categoryFor(item.type) === activeFilter),
    [activeFilter, items],
  );
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const item of items) {
      const category = categoryFor(item.type);
      counts[category] = (counts[category] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  if (!accessToken) {
    return (
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950">
          <Bell className="h-10 w-10" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-black text-white">{t("signedOutTitle")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">{t("signedOutMessage")}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-6 py-3 text-sm font-black text-slate-950"
        >
          {t("signInToView")}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 text-white">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_33%,rgba(245,158,11,0.28),transparent_27%),radial-gradient(circle_at_60%_18%,rgba(124,58,237,0.28),transparent_26%),linear-gradient(110deg,rgba(15,23,42,0.1),rgba(15,23,42,0.9))]" />
        <div className="absolute right-12 top-8 hidden h-56 w-56 rounded-full bg-amber-300/20 blur-3xl lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.35em] text-amber-200">
              <Bell className="h-4 w-4" /> {tNav("notifications")}
            </p>
            <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-6xl">
              {t.rich("heroTitle", {
                highlight: (chunks) => <span className="text-amber-300">{chunks}</span>,
              })}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">{t("heroDescription")}</p>
          </div>

          <div className="relative min-h-[245px] overflow-hidden rounded-[2rem] border border-amber-200/20 bg-gradient-to-br from-amber-300/15 via-slate-950/60 to-violet-600/20 p-6">
            <div className="absolute right-10 top-8 grid h-28 w-28 place-items-center rounded-full bg-amber-300/20 text-amber-200">
              <Bell className="h-16 w-16" />
            </div>
            <div className="absolute right-20 top-7 grid h-11 w-11 place-items-center rounded-full bg-rose-500 font-display text-xl font-black text-white">
              {unreadCount}
            </div>
            <div className="absolute bottom-8 left-8 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-violet-400 to-purple-800 shadow-2xl shadow-purple-500/20">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <div className="relative z-10 max-w-xs">
              <p className="text-sm font-bold text-amber-100">{t("neverMiss")}</p>
              <p className="mt-3 font-display text-5xl font-black text-white">{items.length}</p>
              <p className="text-sm text-slate-300">{t("recentUpdates")}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.slice(0, 6).map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-2xl border px-5 py-3 text-sm font-black transition ${
                activeFilter === filter.id
                  ? "border-amber-300 bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "border-white/10 bg-slate-950/70 text-slate-300 hover:border-white/20"
              }`}
            >
              {t(filter.label)}
            </button>
          ))}
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-sm font-bold text-slate-200 disabled:opacity-50"
          disabled={markRead.isPending || unreadCount === 0}
          onClick={() => markRead.mutate()}
          type="button"
        >
          <Check className="h-4 w-4" /> {t("markAllRead")}
        </button>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {notificationsQuery.isPending ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/75 p-6 text-sm text-slate-300">
              {t("loading")}
            </div>
          ) : (
            filteredItems.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                unread={isUnread(item)}
                onOpen={openNotification}
              />
            ))
          )}
          {!notificationsQuery.isPending && filteredItems.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-slate-950/75 p-5 text-sm text-slate-400">
              {t(items.length === 0 ? "empty" : "emptyCategory")}
            </p>
          ) : null}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
            <h2 className="flex items-center gap-3 font-display text-xl font-black text-white">
              <BarChart3 className="h-5 w-5 text-violet-300" /> {t("summary")}
            </h2>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <SummaryCard icon={<Star className="h-5 w-5" />} label={t("unread")} value={unreadCount} />
              <SummaryCard icon={<Bell className="h-5 w-5" />} label={t("thisWeek")} value={countThisWeek(items)} />
              <SummaryCard icon={<Zap className="h-5 w-5" />} label={t("total")} value={items.length} />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
            <h2 className="flex items-center gap-3 font-display text-xl font-black text-white">
              <Sparkles className="h-5 w-5 text-violet-300" /> {t("filterHeading")}
            </h2>
            <div className="mt-5 space-y-2">
              {FILTERS.map((filter) => {
                const active = activeFilter === filter.id;
                const count = filterCounts[filter.id] ?? 0;
                const icon = filter.id === "achievements"
                  ? <ShieldCheck className="h-4 w-4" />
                  : filter.id === "missions"
                    ? <ClipboardCheck className="h-4 w-4" />
                    : filter.id === "leaderboard"
                      ? <Trophy className="h-4 w-4" />
                      : filter.id === "games"
                        ? <Gamepad2 className="h-4 w-4" />
                        : filter.id === "system"
                          ? <Settings className="h-4 w-4" />
                          : <Bell className="h-4 w-4" />;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition ${
                      active
                        ? "border-amber-300 bg-amber-300/10 text-amber-200"
                        : "border-transparent text-slate-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="flex items-center gap-3">{icon}{t(filter.longLabel)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-amber-300 text-slate-950" : "bg-white/10 text-slate-300"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </aside>
      </section>
    </div>
  );
}
